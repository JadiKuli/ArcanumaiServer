import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from 'src/common/prisma/prisma.service';
import { SupabaseService } from 'src/common/supabase/supabase.service';
import { ValidationService } from 'src/common/validation/validation.service';

@Injectable()
export class PostService {
  constructor(
    private readonly _supabaseService: SupabaseService,
    private readonly _prismaService: PrismaService,
    private readonly _validationService: ValidationService,
  ) {}

  // Post Image
  async postImages(
    data: {
      userId: string;
      caption: string;
      contentPath?: string;
    },
    file?: Express.Multer.File,
  ) {
    let fileName = '';
    if (file) {
      fileName = await this._supabaseService.uploadFile(file);
    } else {
      fileName = data.contentPath || '';
    }

    const post = await this._prismaService.post.create({
      data: {
        userId: data.userId,
        contentPath: fileName,
        caption: data.caption,
      },
      include: {
        Likes: true,
        Comment: true,
      },
    });

    return {
      message: 'Post successfully created',
      data: {
        userId: post.userId,
        postId: post.id,
      },
    };
  }

  //Get Detail Post
  async getDetailPost(data: {
    postId: string;
    cursor?: string;
    take?: number;
    userId?: string;
  }) {
    const take = data.take || 10;
    const cursor = data.cursor;

    const post = await this._prismaService.post.findUnique({
      where: { id: data.postId },
      include: {
        userRelation: true,
        musicRelation: true,
        meshRelation: true,
        _count: {
          select: {
            Likes: true,
            Comment: true,
          },
        },
      },
    });

    if (!post) {
      throw new NotFoundException('Post not found');
    }

    const comments = await this._prismaService.comment.findMany({
      where: { postId: data.postId },
      take,
      skip: cursor ? 1 : 0,
      ...(cursor && {
        cursor: { id: cursor },
      }),
      orderBy: { createdAt: 'desc' },
      include: {
        userRelation: true,
      },
    });

    const like = await this._prismaService.likes.findFirst({
      where: { userId: data.userId, postId: data.postId },
    });

    const nextCursor =
      comments.length === take ? comments[comments.length - 1].id : null;

    return {
      message: 'Data fetched successfully',
      data: {
        post,
        isLiked: !!like,
        comments,
        nextCursor,
      },
    };
  }

  // Get All Posts and By User
  async getAllPosts(cursor?: string, take: number = 15, userId?: string) {
    const allPosts = await this._prismaService.post.findMany({
      take,
      skip: cursor ? 1 : 0,
      ...(cursor && { cursor: { id: cursor } }),
      orderBy: {
        createdAt: 'desc',
      },
      include: {
        musicRelation: true,
        _count: {
          select: {
            Likes: true,
            Comment: true,
          },
        },
      },
      ...(userId && { where: { userId } }),
    });

    const nextCursor =
      allPosts.length === +take ? allPosts[allPosts.length - 1].id : null;

    return {
      message: 'Data Fetched Successfully',
      data: allPosts,
      meta: {
        nextCursor,
        hasMore: !!nextCursor,
      },
    };
  }

  // Update User Post
  async updatePost(postId: string, userId: string, caption: string) {
    const updatingPost = await this._prismaService.post.update({
      where: { id: postId, userId },
      data: {
        caption,
      },
    });

    return {
      message: 'User Updated Successfully',
      data: updatingPost,
    };
  }

  // Delete User Post
  async deletePost(postId: string, userId: string) {
    const post = await this._prismaService.post.findUnique({
      where: { id: postId, userId },
    });

    if (!post) {
      throw new NotFoundException('Post not found');
    }

    return {
      message: 'Post successfully deleted',
    };
  }

  // Like Post
  async likePost(postId: string, userId: string) {
    const post = await this._prismaService.post.findUnique({
      where: { id: postId },
    });

    if (!post) throw new NotFoundException('Post not found');
    const existingLike = await this._prismaService.likes.findFirst({
      where: { userId, postId },
    });

    const isUnlike = !!existingLike;
    if (isUnlike) {
      await this._prismaService.likes.delete({
        where: { id: existingLike.id },
      });
    } else {
      await this._prismaService.likes.create({
        data: { userId, postId },
        include: {
          userRelation: true,
          postRelation: true,
        },
      });
    }

    await this._prismaService.userWallet.update({
      where: { userId: post.userId },
      data: {
        coins: {
          [isUnlike ? 'decrement' : 'increment']: 2,
        },
      },
    });

    return {
      message: `Post ${isUnlike ? 'Unliked' : 'Liked'} Successfully`,
    };
  }

  // Comment Post
  async commentPost(postId: string, userId: string, comment: string) {
    const post = await this._prismaService.post.findUnique({
      where: { id: postId },
    });

    if (!post) throw new NotFoundException('Post not found');

    const newComment = await this._prismaService.comment.create({
      data: {
        userId,
        postId,
        content: comment,
      },
      include: {
        userRelation: true,
        postRelation: true,
      },
    });

    await this._prismaService.userWallet.update({
      where: { userId: post.userId },
      data: {
        coins: {
          increment: 5,
        },
      },
    });

    return {
      message: 'Commented Successfully',
      data: newComment,
    };
  }

  // Delete Comment Post
  async deleteCommentPost(commentId: string, userId: string) {
    const deletingComment = await this._prismaService.comment.delete({
      where: { id: commentId, userId },
    });

    return {
      message: 'Comment successfully deleted',
      data: deletingComment,
    };
  }

  // Get Me Post
  async getMePost(userId: string) {
    const post = await this._prismaService.post.findMany({
      where: { userId },
    });

    return {
      message: 'Data Fetched Successfully',
      data: post,
    };
  }
}
