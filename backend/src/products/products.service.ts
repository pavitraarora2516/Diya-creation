import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateProductDto, UpdateProductDto, CreateCategoryDto } from './products.dto';

@Injectable()
export class ProductsService {
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

  // Categories CRUD
  async getCategories() {
    return this.prisma.category.findMany({
      include: {
        _count: {
          select: { products: true }
        }
      }
    });
  }

  async createCategory(dto: CreateCategoryDto) {
    const existing = await this.prisma.category.findUnique({
      where: { slug: dto.slug }
    });
    if (existing) {
      throw new ConflictException('Category slug already exists');
    }
    return this.prisma.category.create({ data: dto });
  }

  // Products Listing & Filtering
  async getProducts(query: {
    category?: string;
    search?: string;
    minPrice?: number;
    maxPrice?: number;
    isFeatured?: boolean;
    sort?: string;
  }) {
    const where: any = {};

    if (query.category) {
      where.category = { slug: query.category };
    }

    if (query.search) {
      where.OR = [
        { name: { contains: query.search } },
        { description: { contains: query.search } },
      ];
    }

    if (query.isFeatured !== undefined) {
      // Support string or boolean query params
      where.isFeatured = String(query.isFeatured) === 'true';
    }

    if (query.minPrice !== undefined || query.maxPrice !== undefined) {
      where.price = {};
      if (query.minPrice !== undefined) where.price.gte = Number(query.minPrice);
      if (query.maxPrice !== undefined) where.price.lte = Number(query.maxPrice);
    }

    let orderBy: any = { createdAt: 'desc' };
    if (query.sort) {
      if (query.sort === 'price_asc') orderBy = { price: 'asc' };
      else if (query.sort === 'price_desc') orderBy = { price: 'desc' };
      else if (query.sort === 'name_asc') orderBy = { name: 'asc' };
      else if (query.sort === 'name_desc') orderBy = { name: 'desc' };
    }

    return this.prisma.product.findMany({
      where,
      orderBy,
      include: {
        images: true,
        category: true,
        customOptions: true,
      },
    });
  }

  // Admin Product Listing
  async getAdminProducts() {
    return this.prisma.product.findMany({
      orderBy: { createdAt: 'desc' },
      include: {
        images: true,
        category: true,
        customOptions: true,
      },
    });
  }

  async getProductById(id: string) {
    const product = await this.prisma.product.findUnique({
      where: { id },
      include: {
        images: true,
        category: true,
        customOptions: true,
      },
    });
    if (!product) {
      throw new NotFoundException('Product not found');
    }
    return product;
  }

  async getProductBySlug(slug: string) {
    const product = await this.prisma.product.findUnique({
      where: { slug },
      include: {
        images: true,
        category: true,
        customOptions: true,
      },
    });
    if (!product) {
      throw new NotFoundException('Product not found');
    }
    return product;
  }

  // Create Product (Transaction)
  async createProduct(dto: CreateProductDto, adminId?: string) {
    const existing = await this.prisma.product.findUnique({
      where: { sku: dto.sku }
    });
    if (existing) {
      throw new ConflictException('Product SKU already exists');
    }

    const slug = this.slugify(dto.name);
    const existingSlug = await this.prisma.product.findUnique({
      where: { slug }
    });
    const finalSlug = existingSlug ? `${slug}-${Date.now().toString().slice(-4)}` : slug;

    return this.prisma.$transaction(async (tx) => {
      const product = await tx.product.create({
        data: {
          sku: dto.sku,
          name: dto.name,
          slug: finalSlug,
          description: dto.description,
          price: dto.price,
          salePrice: dto.salePrice,
          costPrice: dto.costPrice,
          stock: dto.stock,
          weight: dto.weight,
          shelfLife: dto.shelfLife,
          ingredients: dto.ingredients,
          allergens: dto.allergens,
          packaging: dto.packaging,
          isFeatured: dto.isFeatured || false,
          status: 'PUBLISHED',
          categoryId: dto.categoryId,
          customizable: dto.customizable || false,
        }
      });

      if (dto.images && dto.images.length > 0) {
        await tx.productImage.createMany({
          data: dto.images.map((url, index) => ({
            url,
            isPrimary: index === 0,
            productId: product.id,
          }))
        });
      }

      if (dto.customizable && dto.customOptions && dto.customOptions.length > 0) {
        await tx.productCustomOption.createMany({
          data: dto.customOptions.map(opt => ({
            type: opt.type,
            label: opt.label,
            priceCharge: opt.priceCharge || 0.0,
            productId: product.id,
          }))
        });
      }

      if (adminId) {
        await tx.auditLog.create({
          data: {
            userId: adminId,
            action: 'product.create',
            details: `Created product "${product.name}" (SKU: ${product.sku})`,
          },
        });
      }

      return tx.product.findUnique({
        where: { id: product.id },
        include: {
          images: true,
          customOptions: true,
        }
      });
    });
  }

  // Update Product (Transaction)
  async updateProduct(id: string, dto: UpdateProductDto, adminId?: string) {
    const product = await this.getProductById(id);

    return this.prisma.$transaction(async (tx) => {
      const updateData: any = {
        sku: dto.sku,
        name: dto.name,
        description: dto.description,
        price: dto.price,
        salePrice: dto.salePrice,
        costPrice: dto.costPrice,
        stock: dto.stock,
        weight: dto.weight,
        shelfLife: dto.shelfLife,
        ingredients: dto.ingredients,
        allergens: dto.allergens,
        packaging: dto.packaging,
        isFeatured: dto.isFeatured,
        categoryId: dto.categoryId,
        customizable: dto.customizable,
      };

      Object.keys(updateData).forEach(
        key => updateData[key] === undefined && delete updateData[key],
      );

      if (dto.name && dto.name !== product.name) {
        const slug = this.slugify(dto.name);
        const existingSlug = await tx.product.findFirst({
          where: { slug, id: { not: id } }
        });
        updateData.slug = existingSlug ? `${slug}-${Date.now().toString().slice(-4)}` : slug;
      }

      await tx.product.update({
        where: { id },
        data: updateData,
      });

      if (dto.images !== undefined) {
        await tx.productImage.deleteMany({ where: { productId: id } });
        if (dto.images.length > 0) {
          await tx.productImage.createMany({
            data: dto.images.map((url, index) => ({
              url,
              isPrimary: index === 0,
              productId: id,
            }))
          });
        }
      }

      if (dto.customizable !== undefined || dto.customOptions !== undefined) {
        const isCustom = dto.customizable !== undefined ? dto.customizable : product.customizable;
        if (!isCustom) {
          await tx.productCustomOption.deleteMany({ where: { productId: id } });
        } else if (dto.customOptions !== undefined) {
          await tx.productCustomOption.deleteMany({ where: { productId: id } });
          if (dto.customOptions.length > 0) {
            await tx.productCustomOption.createMany({
              data: dto.customOptions.map(opt => ({
                type: opt.type,
                label: opt.label,
                priceCharge: opt.priceCharge || 0.0,
                productId: id,
              }))
            });
          }
        }
      }

      if (adminId) {
        await tx.auditLog.create({
          data: {
            userId: adminId,
            action: 'product.update',
            details: `Updated product "${dto.name || product.name}" (SKU: ${dto.sku || product.sku})`,
          },
        });
      }

      return tx.product.findUnique({
        where: { id },
        include: {
          images: true,
          customOptions: true,
        }
      });
    });
  }

  // Delete Product
  async deleteProduct(id: string, adminId?: string) {
    const product = await this.getProductById(id);
    await this.prisma.$transaction(async (tx) => {
      await tx.product.delete({ where: { id } });
      if (adminId) {
        await tx.auditLog.create({
          data: {
            userId: adminId,
            action: 'product.delete',
            details: `Deleted product "${product.name}" (SKU: ${product.sku})`,
          },
        });
      }
    });
    return { success: true, message: 'Product deleted successfully' };
  }
}
