import { Injectable } from '@nestjs/common';
import { Category } from './category.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

@Injectable()
export class CategoriesService {
  constructor(@InjectRepository(Category) private repo: Repository<Category>) {}

  getAllCategories() {
    return this.repo.find({
      order: {
        order: {
          direction: 'ASC',
        },
      },
    });
  }

  getCategory(categoryId: number) {
    return this.repo.findOneBy({ id: categoryId });
  }
}
