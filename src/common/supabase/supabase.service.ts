import { BadRequestException, Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { createClient, SupabaseClient } from '@supabase/supabase-js';

@Injectable()
export class SupabaseService {
  private readonly _supabase: SupabaseClient;
  constructor(private readonly _configService: ConfigService) {
    this._supabase = createClient(
      _configService.get<string>('SUPABASE_URL', 'defaulturl'),
      _configService.get<string>('SUPABASE_SERVICE_ROLE_KEY', 'defaulturl'),
    );
  }

  private bucketUrlPrefix(bucket: 'posts'): string {
    return `${process.env.SUPABASE_URL}/storage/v1/object/public/${bucket}/`;
  }

  async uploadFile(File: Express.Multer.File): Promise<string> {
    const filePath = `public/${Date.now()}-${File.originalname}`;
    const { error } = await this._supabase.storage
      .from('posts')
      .upload(filePath, File.buffer, {
        cacheControl: '3600',
        contentType: File.mimetype,
        upsert: false,
      });

    if (error) {
      console.error('Supabase: ', error);
      throw new BadRequestException(error.message);
    }

    const { data } = this._supabase.storage
      .from('posts')
      .getPublicUrl(filePath);

    return data.publicUrl;
  }

  async updateFile(
    File: Express.Multer.File,
    fileName: string,
  ): Promise<void | string> {
    if (fileName) {
      await this.deleteFile(fileName);
    }

    try {
      return await this.uploadFile(File);
    } catch (error) {
      console.error('Supabase: ', error);
      throw new BadRequestException('Error updated file');
    }
  }

  async deleteFile(filename: string): Promise<void> {
    const filePath = filename.replace(this.bucketUrlPrefix('posts'), '');

    const { error } = await this._supabase.storage
      .from('posts')
      .remove([filePath]);

    if (error) {
      console.error('(Supabase/Delete) Error deleting file:', error);
      throw error;
    }

    return;
  }
}
