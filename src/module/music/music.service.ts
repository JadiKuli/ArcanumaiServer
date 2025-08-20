/* eslint-disable */
import { BadRequestException, Injectable } from '@nestjs/common';
import { PrismaService } from 'src/common/prisma/prisma.service';
import { GenerateMusicPayload, MusicApiResponse } from './types/music';
import axios from 'axios';
import { Music } from 'generated/prisma';
import { MusicWorker } from './worker/music.worker';
import { downloadFile } from 'src/shared/utils/lib/downloadFile';
import * as path from 'path';

@Injectable()
export class MusicService {
  constructor(
    private readonly _prismaService: PrismaService,
    private readonly _musicWorker: MusicWorker,
  ) {}

  BASE_URL = 'https://api.musicapi.ai/api/v1/sonic';

  // Create Music
  async createMusic(
    userId: string,
    payload: GenerateMusicPayload,
  ): Promise<{ message: string; id: string }> {
    const last = await this._prismaService.music.findFirst({
      where: { userId },
      orderBy: { createdAt: 'desc' },
    });

    if (last?.state === 'pending') {
      throw new BadRequestException(
        'Please wait for the previous task to finish',
      );
    }

    const create_task = await axios.post<MusicApiResponse>(
      `${this.BASE_URL}/create`,
      payload,
      {
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${process.env.MUSIC_API_KEY}`,
        },
      },
    );

    const data = create_task.data;
    await this._prismaService.music.create({
      data: {
        title: payload.title,
        propmt: payload.prompt,
        mv: payload.mv,
        tags: payload.tags,
        userId,
        externalId: data.task_id,
        state: 'pending',
      },
    });

    this._musicWorker.addToQueue(data.task_id);
    return {
      message: 'Your music is being generated',
      id: data.task_id,
    };
  }

  // Get Music User
  async getMusic(userId: string) {
    const music = await this._prismaService.music.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
    });

    return {
      message: 'Data Fetched Successfully',
      data: music,
    };
  }

  // Get All Music
  async getAllMusic(): Promise<Music[]> {
    try {
      return await this._prismaService.music.findMany({
        include: {
          user: {
            select: {
              id: true,
              username: true,
            },
          },
        },
      });
    } catch (error) {
      throw new BadRequestException('Error getting all music', error);
    }
  }

  // Get Progress Music
  async getProgressMusic(userId: string, taskId: string) {
    const fetchResult = await axios.get(`${this.BASE_URL}/task/${taskId}`, {
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${process.env.MUSIC_API_KEY}`,
      },
    });

    const result = fetchResult.data.data[0];
    if (!result) {
      throw new BadRequestException('Task not found in external API');
    }

    if (result.state === 'succeeded') {
      console.log(result);
      const getFileExtension = (url: string): string =>
        path.extname(new URL(url).pathname) || '.bin';

      const imageExt = result.image_url
        ? getFileExtension(result.image_url)
        : '.jpg';
      const audioExt = result.audio_url
        ? getFileExtension(result.audio_url)
        : '.mp3';
      const videoExt = result.video_url
        ? getFileExtension(result.video_url)
        : '.mp4';

      const imagePath = `storage/assets/images/${taskId}${imageExt}`;
      const audioPath = `storage/assets/music/${taskId}${audioExt}`;
      const videoPath = `storage/assets/videos/${taskId}${videoExt}`;

      if (result.image_url) await downloadFile(result.image_url, imagePath);
      if (result.audio_url) await downloadFile(result.audio_url, audioPath);
      if (result.video_url) await downloadFile(result.video_url, videoPath);

      const music = await this._prismaService.music.findFirst({
        where: { externalId: taskId, userId },
      });

      if (!music) {
        throw new BadRequestException('Music not found');
      }

      const updateMusic = await this._prismaService.music.update({
        where: { id: music.id },
        data: {
          title: result.title,
          tags: result.tags,
          audioUrl: `${process.env.BASE_URL}/assets/music/${taskId}${audioExt}`,
          imageUrl: `${process.env.BASE_URL}/assets/images/${taskId}${imageExt}`,
          videoUrl: `${process.env.BASE_URL}/assets/videos/${taskId}${videoExt}`,
          state: 'completed',
        },
      });

      await this._prismaService.post.create({
        data: {
          userId,
          musicId: updateMusic.id,
          contentPath: updateMusic.audioUrl,
          caption: updateMusic.propmt || 'AI Music Generator',
        },
      });

      return { status: 'completed' };
    }
    return { status: result.state || 'pending' };
  }
}
