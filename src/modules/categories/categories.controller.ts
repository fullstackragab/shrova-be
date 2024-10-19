import { Controller, Get, Param } from '@nestjs/common';
import { CategoriesService } from './categories.service';

@Controller('categories')
export class CategoriesController {
  constructor(private readonly categoriesService: CategoriesService) {}

  @Get()
  getAll() {
    return this.categoriesService.getAllCategories();
  }

  @Get(':id')
  getCategory(@Param('id') categoryId: number) {
    return this.categoriesService.getCategory(categoryId);
  }
}
