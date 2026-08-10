import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateBlogPostDto } from './cms.dto';

@Injectable()
export class CmsService {
  constructor(private prisma: PrismaService) {}

  private slugify(text: string) {
    return text
      .toString()
      .toLowerCase()
      .trim()
      .replace(/\s+/g, '-') // Replace spaces with -
      .replace(/[^\w\-]+/g, '') // Remove all non-word chars
      .replace(/\-\-+/g, '-'); // Replace multiple - with single -
  }

  // 1. Create a Blog Post
  async createBlogPost(dto: CreateBlogPostDto) {
    const slug = dto.slug || this.slugify(dto.title);

    const existing = await this.prisma.blog.findUnique({
      where: { slug },
    });
    if (existing) {
      throw new ConflictException('Blog post with this slug or title already exists');
    }

    return this.prisma.blog.create({
      data: {
        title: dto.title,
        slug,
        content: dto.content,
        author: dto.author,
        imageUrl: dto.imageUrl,
        metaTitle: dto.metaTitle || dto.title,
        metaDesc: dto.metaDesc || dto.content.slice(0, 150),
      },
    });
  }

  // 2. Get All Blog Posts
  async getAllBlogPosts() {
    return this.prisma.blog.findMany({
      orderBy: {
        createdAt: 'desc',
      },
    });
  }

  // 3. Get Blog Post by Slug
  async getBlogPostBySlug(slug: string) {
    const post = await this.prisma.blog.findUnique({
      where: { slug },
    });
    if (!post) {
      throw new NotFoundException('Blog post not found');
    }
    return post;
  }

  // 4. Delete Blog Post
  async deleteBlogPost(id: string) {
    const post = await this.prisma.blog.findUnique({
      where: { id },
    });
    if (!post) {
      throw new NotFoundException('Blog post not found');
    }

    await this.prisma.blog.delete({
      where: { id },
    });
    return { success: true, message: 'Blog post deleted successfully' };
  }

  // 5. Upsert Settings
  async updateSetting(key: string, value: string) {
    return this.prisma.setting.upsert({
      where: { key },
      update: { value },
      create: { key, value },
    });
  }

  // 6. Get Setting
  async getSetting(key: string) {
    const setting = await this.prisma.setting.findUnique({
      where: { key },
    });
    if (!setting) {
      return { key, value: null };
    }
    return setting;
  }
}
