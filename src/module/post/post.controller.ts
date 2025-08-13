import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  Put,
  Query,
  Request,
  UploadedFile,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { PostService } from './post.service';
import { JwtGuard } from '../auth/jwt/guards/jwt.guard';
import { FileInterceptor } from '@nestjs/platform-express';
import MulterConfig from 'src/shared/config/multer.config';
import { IAuthenticationRequest } from 'src/shared/types/request-user';

@Controller('api/posts')
export class PostController {
  constructor(private readonly _postService: PostService) {}

  // Add New Post
  @Post()
  @UseGuards(JwtGuard)
  @UseInterceptors(FileInterceptor('file', MulterConfig))
  async postImages(
    @Request() req: IAuthenticationRequest,
    @Body() data: { caption: string },
    @UploadedFile() file: Express.Multer.File,
  ) {
    return this._postService.postImages(
      {
        userId: req.user.sub,
        caption: data.caption,
      },
      file,
    );
  }

  // Get Detail Post
  @Get(':id')
  @UseGuards(JwtGuard)
  async getDetail(
    @Param('id') postId: string,
    @Query('cursor') cursor?: string,
    @Query('take') take?: number,
    @Request() req?: IAuthenticationRequest,
  ) {
    return this._postService.getDetailPost({
      postId,
      cursor,
      take,
      userId: req?.user?.sub,
    });
  }

  // Get All Post and By User
  @Get()
  async getAllPosts(
    @Query('cursor') cursor?: string,
    @Query('id') id?: string,
    @Request() req?: IAuthenticationRequest,
  ) {
    return this._postService.getAllPosts(cursor, 15, req?.user?.sub || id);
  }

  // Update User Post
  @Put(':id')
  @UseGuards(JwtGuard)
  async updatePost(
    @Param('id') postId: string,
    @Request() req: IAuthenticationRequest,
    @Body() data: { caption: string },
  ) {
    return this._postService.updatePost(postId, req.user.sub, data.caption);
  }

  // Delete User Post
  @Delete(':id')
  @UseGuards(JwtGuard)
  async deletePost(
    @Param('id') postId: string,
    @Request() req: IAuthenticationRequest,
  ) {
    return this._postService.deletePost(postId, req.user.sub);
  }

  //Like Comment
  //Add Remove Like
  @Post('like/:id')
  @UseGuards(JwtGuard)
  async likePost(
    @Param('id') postId: string,
    @Request() req: IAuthenticationRequest,
  ) {
    return this._postService.likePost(postId, req.user.sub);
  }

  // Add Comment
  @Post('comment/:id')
  @UseGuards(JwtGuard)
  async commentPost(
    @Param('id') postId: string,
    @Request() req: IAuthenticationRequest,
    @Body() data: { comment: string },
  ) {
    return this._postService.commentPost(postId, req.user.sub, data.comment);
  }

  // Delete Comment
  @Delete('comment/:id')
  @UseGuards(JwtGuard)
  async deleteCommentPost(
    @Param('id') commentId: string,
    @Request() req: IAuthenticationRequest,
  ) {
    return this._postService.deleteCommentPost(commentId, req.user.sub);
  }

  // Get Me Post
  @Get('me')
  @UseGuards(JwtGuard)
  async getMePost(@Request() req: IAuthenticationRequest) {
    return this._postService.getMePost(req.user.sub);
  }
}
