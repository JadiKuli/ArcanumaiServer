/* eslint-disable */
import { Injectable } from '@nestjs/common';
import axios from 'axios';
import * as fs from 'fs';
import * as path from 'path';
import { URL } from 'url';
import { spawn } from 'child_process';
import { PrismaService } from 'src/common/prisma/prisma.service';
import { WebsocketGateway } from 'src/shared/config/websocket.config';

const MAX_TIME = 10 * 60 * 1000;
const POLL_INTERVAL = 5000;

@Injectable()
export class MeshWorker {
  private static queue: string[] = [];
  private static isProcessing = false;

  constructor(
    private readonly prisma: PrismaService,
    private readonly ws: WebsocketGateway,
  ) {}

  public addToQueue(taskId: string): void {
    if (!MeshWorker.queue.includes(taskId)) {
      MeshWorker.queue.push(taskId);
      this.ws.sendMessage(taskId, 'queued', 'Rodin task added to queue.');

      if (!MeshWorker.isProcessing) {
        void this.boot();
      }
    }
  }

  public async boot(): Promise<void> {
    if (MeshWorker.isProcessing) return;
    MeshWorker.isProcessing = true;
    console.log('🚀 MeshRodin worker started');

    const pollQueue = async () => {
      if (MeshWorker.queue.length > 0) {
        const taskId = MeshWorker.queue.shift();
        if (taskId) {
          await this.processTask(taskId);
        }
        setTimeout(() => void pollQueue(), POLL_INTERVAL);
      } else {
        MeshWorker.isProcessing = false;
        console.log('⏹ MeshRodin worker stopped (queue empty)');
      }
    };

    void pollQueue();
  }

  private async generateThumbnailFromGlb(
    localGlbPath: string,
    localOutPath: string,
  ): Promise<void> {
    const projectRoot = process.cwd();

    const scriptPath =
      process.env.BLENDER_PY || path.join(projectRoot, 'render_thumb.py');
    const absGlb = path.resolve(projectRoot, localGlbPath);
    const absOut = path.resolve(projectRoot, localOutPath);

    if (!fs.existsSync(absGlb)) {
      throw new Error(`GLB file not found at ${absGlb}`);
    }

    return new Promise((resolve, reject) => {
      const args = ['-b', '-noaudio', '-P', scriptPath, '--', absGlb, absOut];

      const blender = spawn('blender', args, {
        cwd: projectRoot,
        stdio: ['ignore', 'pipe', 'pipe'],
      });

      blender.stdout.on('data', (d) => console.log(`[Blender]: ${d}`));
      blender.stderr.on('data', (d) => console.error(`[Blender ERR]: ${d}`));

      blender.on('exit', (code) => {
        if (code === 0) {
          resolve();
        } else {
          reject(new Error(`Blender exited with code ${code}`));
        }
      });

      blender.on('error', (err) => {
        reject(new Error(`Failed to spawn Blender: ${err.message}`));
      });
    });
  }

  private async processTask(taskId: string): Promise<void> {
    this.ws.sendMessage(
      taskId,
      'processing',
      'Worker started processing Rodin model.',
    );
    const startTime = Date.now();
    const fatalErrorStartTime = { time: null as null | number };

    while (true) {
      if (Date.now() - startTime > MAX_TIME) {
        this.ws.sendMessage(taskId, 'timeout', 'Rodin worker timeout.');
        await this.prisma.mesh.update({
          where: { taskIdPreview: taskId },
          data: { state: 'failed' },
        });
        break;
      }

      try {
        const result = await (
          await import('@fal-ai/client')
        ).fal.queue.result('fal-ai/hyper3d/rodin', {
          requestId: taskId,
        });

        this.ws.sendMessage(
          taskId,
          'downloading',
          'Downloading Rodin model files...',
        );

        const glbUrl = result.data.model_mesh.url;
        const glbExt = path.extname(new URL(glbUrl).pathname) || '.glb';
        const glbPath = `storage/assets/models/${taskId}${glbExt}`;
        const glbModelUrlPath = `${process.env.BASE_URL}/assets/models/${taskId}${glbExt}`;
        await this.downloadFile(glbUrl, glbPath, taskId);

        let finalImageUrl: string | null =
          'https://logicai.technology/icon.png';
        const textures = result.data.textures;

        if (textures && textures.length > 0) {
          const firstTextureUrl = (textures[0] as any).url;
          const textureExt =
            path.extname(new URL(firstTextureUrl).pathname) || '.png';
          const localImagePath = `storage/assets/images/${taskId}_refine${textureExt}`;
          await this.downloadFile(firstTextureUrl, localImagePath, taskId);
          finalImageUrl = `${process.env.BASE_URL}/assets/images/${taskId}_refine${textureExt}`;
        } else {
          this.ws.sendMessage(
            taskId,
            'generating_thumbnail',
            'No image found, generating thumbnail...',
          );
          const thumbnailLocalPath = `storage/assets/images/${taskId}_thumb.png`;

          try {
            await this.generateThumbnailFromGlb(glbPath, thumbnailLocalPath);
            finalImageUrl = `${process.env.BASE_URL}/assets/images/${taskId}_thumb.png`;
            this.ws.sendMessage(
              taskId,
              'generating_thumbnail_done',
              'Thumbnail generated successfully.',
            );

            const updatedMesh = await this.prisma.mesh.update({
              where: { taskIdPreview: taskId },
              data: {
                modelGlbRefine: glbModelUrlPath,
                refineImage: finalImageUrl,
                state: 'succeeded',
              },
            });

            const createPost = await this.prisma.post.create({
              data: {
                userId: updatedMesh.userId || '',
                meshId: updatedMesh.id,
                contentPath: finalImageUrl,
                caption: updatedMesh.prompt,
              },
            });

            this.ws.sendMessage(taskId, 'done', '3D generated successfully.');

            break;
          } catch (thumbError: any) {
            console.error(
              `Failed to generate thumbnail for ${taskId}:`,
              thumbError.message,
            );
            this.ws.sendMessage(
              taskId,
              'generating_thumbnail_failed',
              'Failed to generate thumbnail.',
            );
          }
        }

        // try {
        //   for (const texture of result.data.textures) {
        //     const textureUrl = (texture as any).url;
        //     const textureFileName = (texture as any).file_name;
        //     const texturePath = `storage/assets/images/${taskId}_${textureFileName}`;

        //     await this.downloadFile(textureUrl, texturePath, taskId);

        //     await this.prisma.texture.create({
        //       data: {
        //         meshId: updatedMesh.id,
        //         type: 'pbr_texture',
        //         url: `${process.env.BASE_URL}/assets/images/${taskId}_${textureFileName}`,
        //       },
        //     });
        //   }
        // } catch (textureError: any) {
        //   console.error(
        //     `Failed to process textures for ${taskId}:`,
        //     textureError.message,
        //   );
        //   this.ws.sendMessage(
        //     taskId,
        //     'warning',
        //     'Some textures failed to process, but model is ready.',
        //   );
        // }

        // this.ws.sendMessage(
        //   taskId,
        //   'done',
        //   'Rodin task completed successfully.',
        // );

        break;
      } catch (error: any) {
        const mesh = await this.prisma.mesh.findUnique({
          where: { taskIdPreview: taskId },
          select: { state: true },
        });

        if (mesh?.state === 'succeeded' || mesh?.state === 'failed') {
          console.log(
            `Task ${taskId} already completed with state: ${mesh.state}`,
          );
          break;
        }

        if (
          error.message.includes('404') ||
          error.message.includes('not found') ||
          error.message.includes('Bad Request') ||
          error.message.includes('400')
        ) {
          this.ws.sendMessage(
            taskId,
            'waiting',
            'Still processing Rodin model...',
          );
        } else {
          if (!fatalErrorStartTime.time) {
            fatalErrorStartTime.time = Date.now();
          } else if (Date.now() - fatalErrorStartTime.time > 60 * 1000) {
            this.ws.sendMessage(
              taskId,
              'timeout',
              'Rodin model failed after repeated errors.',
            );
            await this.prisma.mesh.update({
              where: { taskIdPreview: taskId },
              data: { state: 'failed' },
            });
            break;
          }

          console.error(`Non-fatal error for task ${taskId}:`, error.message);
          this.ws.sendMessage(
            taskId,
            'error',
            `Error processing Rodin task: ${error.message}`,
          );
        }
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
        resolve(outputPath.replace('storage/', ''));
      });
      writer.on('error', reject);
    });
  }
}
