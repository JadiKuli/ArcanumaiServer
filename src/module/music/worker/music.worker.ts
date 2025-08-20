/* eslint-disable */
import { Injectable, OnModuleInit } from '@nestjs/common';
import axios from 'axios';
import * as fs from 'fs';
import * as path from 'path';
import { PrismaService } from 'src/common/prisma/prisma.service';
import { WebsocketGateway } from 'src/shared/config/websocket.config';

const BASE_URL = 'https://api.musicapi.ai/api/v1/sonic';
const MAX_TIME = 7 * 60 * 1000;
const POLL_INTERVAL = 2500;

@Injectable()
export class MusicWorker {
  private static queue: string[] = [];
  private static isProcessing = false;

  constructor(
    private readonly ws: WebsocketGateway,
    private readonly prisma: PrismaService,
  ) {}

  public addToQueue(taskId: string): void {
    if (!MusicWorker.queue.includes(taskId)) {
      MusicWorker.queue.push(taskId);
      this.ws.sendMessage(taskId, 'queued', 'Task added to queue.');
      console.log(`📌 Task ${taskId} added to queue`);

      if (!MusicWorker.isProcessing) {
        void this.boot();
      }
    }
  }

  public async boot(): Promise<void> {
    if (MusicWorker.isProcessing) return;
    MusicWorker.isProcessing = true;
    console.log('🚀 Worker started');

    const pollQueue = async () => {
      if (MusicWorker.queue.length > 0) {
        const taskId = MusicWorker.queue.shift();
        if (taskId) {
          await this.processTask(taskId);
          console.log(`📌 Task ${taskId} processed`);
        }
        setTimeout(() => void pollQueue(), POLL_INTERVAL);
      } else {
        MusicWorker.isProcessing = false;
        console.log('⏹ Worker stopped (queue empty)');
      }
    };

    void pollQueue();
  }

  private async processTask(taskId: string): Promise<void> {
    this.ws.sendMessage(taskId, 'processing', 'Worker started processing.');
    const startTime = Date.now();
    console.log(`📌 Processing task ${taskId}`);

    while (true) {
      try {
        console.log(`📌 Fetching task ${taskId}`);
        const fetchResult = await axios.get(`${BASE_URL}/task/${taskId}`, {
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${process.env.MUSIC_API_KEY}`,
          },
        });

        const result = fetchResult.data.data[0];

        if (result?.state === 'succeeded') {
          this.ws.sendMessage(taskId, 'downloading', 'Downloading files...');

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

          if (result.image_url)
            await this.downloadFile(result.image_url, imagePath, taskId);
          if (result.audio_url)
            await this.downloadFile(result.audio_url, audioPath, taskId);
          if (result.video_url)
            await this.downloadFile(result.video_url, videoPath, taskId);

          const music = await this.prisma.music.findUnique({
            where: { externalId: taskId },
          });

          if (!music) {
            throw new Error(`Music with taskId ${taskId} not found`);
          }

          const updatedMusic = await this.prisma.music.update({
            where: { externalId: taskId },
            data: {
              title: result.title,
              tags: result.tags,
              audioUrl: `${process.env.BASE_URL}/assets/music/${taskId}${audioExt}`,
              imageUrl: `${process.env.BASE_URL}/assets/images/${taskId}${imageExt}`,
              videoUrl: `${process.env.BASE_URL}/assets/videos/${taskId}${videoExt}`,
              state: 'succeeded',
            },
          });

          await this.prisma.post.create({
            data: {
              userId: music.userId,
              musicId: updatedMusic.id,
              contentPath: updatedMusic.audioUrl,
              caption: music.propmt || 'AI Music Generator',
            },
          });

          console.log(`📌 Task ${taskId} completed`);
          this.ws.sendMessage(taskId, 'done', 'Task completed.');
          break;
        }

        console.log(`📌 Task ${taskId} state: ${result?.state}`);
        this.ws.sendMessage(taskId, 'waiting', 'Still processing...');
      } catch (error: any) {
        this.ws.sendMessage(taskId, 'error', `Error: ${error.message}`);
        console.error(`📌 Error processing task ${taskId}: ${error.message}`);
      }

      if (Date.now() - startTime > MAX_TIME) {
        this.ws.sendMessage(taskId, 'timeout', 'Worker timeout.');
        break;
      }

      await new Promise((resolve) => setTimeout(resolve, POLL_INTERVAL));
    }
  }

  private async downloadFile(
    url: string,
    outputPath: string,
    taskId: string,
  ): Promise<string> {
    if (!url) return '';

    const writer = fs.createWriteStream(outputPath);
    const response = await axios({
      url,
      method: 'GET',
      responseType: 'stream',
    });

    response.data.pipe(writer);

    return new Promise((resolve, reject) => {
      writer.on('finish', () => {
        this.ws.sendMessage(taskId, 'download', `File saved: ${outputPath}`);
        resolve(outputPath);
      });
      writer.on('error', reject);
    });
  }
}
