/* eslint-disable */
import { BadRequestException, Injectable } from '@nestjs/common';
import { PrismaService } from 'src/common/prisma/prisma.service';
import { GenerateMusicPayload, MusicApiResponse } from './types/music';
import axios from 'axios';
import { Music } from 'generated/prisma';
import { MusicWorker } from './worker/music.worker';

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
}
