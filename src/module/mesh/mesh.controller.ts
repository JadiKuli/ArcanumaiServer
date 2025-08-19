import {
  Body,
  Controller,
  Get,
  Param,
  Post,
  Request,
  UseGuards,
} from '@nestjs/common';
import { MeshService } from './mesh.service';
import { JwtGuard } from '../auth/jwt/guards/jwt.guard';
import { IAuthenticationRequest } from 'src/shared/types/request-user';
import { GenerateMeshPayload } from './types/mesh';

@Controller('api/mesh')
export class MeshController {
  constructor(private readonly _meshService: MeshService) {}

  // Create Mesh
  @Post()
  @UseGuards(JwtGuard)
  async createMesh(
    @Request() req: IAuthenticationRequest,
    @Body() payload: GenerateMeshPayload,
  ) {
    return await this._meshService.createModel(payload, req.user.sub);
  }

  // Get Mesh
  @Get('/user/all')
  @UseGuards(JwtGuard)
  async getMeshUser(@Request() req: IAuthenticationRequest) {
    return await this._meshService.getMeshUser(req.user.sub);
  }

  // Get Mesh By ID
  @Get(':id')
  @UseGuards(JwtGuard)
  async getMeshById(
    @Request() req: IAuthenticationRequest,
    @Param('id') id: string,
  ) {
    return await this._meshService.getMeshById(id);
  }
}
