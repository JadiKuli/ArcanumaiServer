import { BadRequestException, Injectable } from '@nestjs/common';
import { GenerateMeshPayload } from './types/mesh';
import { fal } from '@fal-ai/client';
import { PrismaService } from 'src/common/prisma/prisma.service';
import { MeshWorker } from './worker/mesh.worker';

@Injectable()
export class MeshService {
  constructor(
    private readonly _prismaService: PrismaService,
    private readonly _meshWorker: MeshWorker,
  ) {}

  async createModel(payload: GenerateMeshPayload, userId: string) {
    try {
      const falResponse = await fal.queue.submit('fal-ai/hyper3d/rodin', {
        input: {
          prompt: payload.prompt,
          geometry_file_format: 'glb',
          quality: 'high',
          material: 'PBR',
          tier: 'Regular',
        },
      });

      const mesh = await this._prismaService.mesh.create({
        data: {
          taskIdPreview: falResponse.request_id,
          prompt: payload.prompt,
          modelType: payload.art_style || '',
          state: 'pending',
          userId,
        },
      });

      this._meshWorker.addToQueue(falResponse.request_id);
      return mesh;
    } catch (error) {
      console.error(error);
      throw new BadRequestException('Error generating model');
    }
  }

  async getMeshUser(userId: string) {
    const mesh = await this._prismaService.mesh.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
    });

    return {
      message: 'Data Fetched Successfully',
      data: mesh,
    };
  }

  async getMeshById(id: string) {
    const mesh = await this._prismaService.mesh.findFirst({
      where: { id },
      include: {
        user: true,
      },
      orderBy: { createdAt: 'desc' },
    });

    return {
      message: 'Data Fetched Successfully',
      data: mesh,
    };
  }
}
