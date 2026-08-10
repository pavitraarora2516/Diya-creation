import { Controller, Get, Post, Put, Delete, Body, Param, Query, UseGuards } from '@nestjs/common';
import { ProductsService } from './products.service';
import { CreateProductDto, UpdateProductDto, CreateCategoryDto } from './products.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { PermissionsGuard } from '../auth/roles.guard';
import { RequirePermissions } from '../auth/permissions.decorator';
import { CurrentUser } from '../auth/current-user.decorator';

@Controller('products')
export class ProductsController {
  constructor(private productsService: ProductsService) {}

  @Get('categories')
  async getCategories() {
    return this.productsService.getCategories();
  }

  @Post('categories')
  @UseGuards(JwtAuthGuard, PermissionsGuard)
  @RequirePermissions('products.create')
  async createCategory(@Body() dto: CreateCategoryDto) {
    return this.productsService.createCategory(dto);
  }

  @Get()
  async getProducts(
    @Query('category') category?: string,
    @Query('search') search?: string,
    @Query('minPrice') minPrice?: number,
    @Query('maxPrice') maxPrice?: number,
    @Query('isFeatured') isFeatured?: boolean,
    @Query('sort') sort?: string,
  ) {
    return this.productsService.getProducts({
      category,
      search,
      minPrice,
      maxPrice,
      isFeatured,
      sort,
    });
  }

  @Get('admin')
  @UseGuards(JwtAuthGuard, PermissionsGuard)
  @RequirePermissions('products.view')
  async getAdminProducts() {
    return this.productsService.getAdminProducts();
  }

  @Get('slug/:slug')
  async getProductBySlug(@Param('slug') slug: string) {
    return this.productsService.getProductBySlug(slug);
  }

  @Get(':id')
  async getProductById(@Param('id') id: string) {
    return this.productsService.getProductById(id);
  }

  @Post()
  @UseGuards(JwtAuthGuard, PermissionsGuard)
  @RequirePermissions('products.create')
  async createProduct(@CurrentUser() user: any, @Body() dto: CreateProductDto) {
    return this.productsService.createProduct(dto, user.id);
  }

  @Put(':id')
  @UseGuards(JwtAuthGuard, PermissionsGuard)
  @RequirePermissions('products.edit')
  async updateProduct(@CurrentUser() user: any, @Param('id') id: string, @Body() dto: UpdateProductDto) {
    return this.productsService.updateProduct(id, dto, user.id);
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard, PermissionsGuard)
  @RequirePermissions('products.delete')
  async deleteProduct(@CurrentUser() user: any, @Param('id') id: string) {
    return this.productsService.deleteProduct(id, user.id);
  }
}
