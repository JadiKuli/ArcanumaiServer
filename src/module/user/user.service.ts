import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/common/prisma/prisma.service';

@Injectable()
export class UserService {
  constructor(private readonly _prismaService: PrismaService) {}

  async getUser(id: string) {
    return this._prismaService.user.findUnique({
      where: { id },
    });
  }
}
