import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/common/prisma/prisma.service';
import { IUserUpdatePayload } from './types/user';

@Injectable()
export class UserService {
  constructor(private readonly _prismaService: PrismaService) {}

  async getUser(id: string) {
    return this._prismaService.user.findUnique({
      where: { id },
      include: {
        UserWallet: true,
        _count: {
          select: {
            Post: true,
            Likes: true,
            Comment: true,
          },
        },
      },
    });
  }

  async updateUser(payload: IUserUpdatePayload, userId: string) {
    return this._prismaService.user.update({
      where: { id: userId },
      data: {
        username: payload.username,
        password: payload.password,
        UserWallet: {
          update: {
            walletId: payload.walletId,
          },
        },
      },
      include: {
        UserWallet: true,
      },
    });
  }

  async userLikedContent(userId: string) {
    return this._prismaService.post.findMany({
      where: {
        Likes: {
          some: {
            userId,
          },
        },
      },
      include: {
        _count: {
          select: {
            Likes: true,
            Comment: true,
          },
        },
        musicRelation: true,
        meshRelation: true,
      },
    });
  }
}
