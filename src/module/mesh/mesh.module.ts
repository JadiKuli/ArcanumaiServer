import { Module } from '@nestjs/common';
import { MeshController } from './mesh.controller';
import { MeshService } from './mesh.service';
import { CommonModule } from 'src/common/common.module';
import { MeshWorker } from './worker/mesh.worker';

@Module({
  imports: [CommonModule],
  controllers: [MeshController],
  providers: [MeshService, MeshWorker],
})
export class MeshModule {}
