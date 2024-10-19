import {
  Injectable,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import { Product } from './product.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { DeepPartial, ILike, In, Repository } from 'typeorm';
import { ProductFile } from './product-file.entity';

@Injectable()
export class ProductsService {
  constructor(
    @InjectRepository(Product) private repo: Repository<Product>,
    @InjectRepository(ProductFile)
    private repoProductFile: Repository<ProductFile>,
  ) {}

  async addProduct(dto: DeepPartial<Product>) {
    const product = this.repo.create(dto);
    const saved = await this.repo.save(product);
    if (saved) return saved;
    else throw new InternalServerErrorException('Error Adding Product');
  }

  async deleteOldProductFiles(productId: number) {
    const pFiles = await this.repoProductFile.findBy({
      productId,
    });
    return await this.repoProductFile.remove(pFiles);
  }

  async addProductFile(
    productId: number,
    fileId: number,
    type: string,
    order: number,
  ) {
    const productFile = await this.repoProductFile.create({
      productId,
      fileId,
      type,
      order,
    });
    return await this.repoProductFile.save(productFile);
  }

  async deleteProductFile(productId: number, fileId: number) {
    const productFile = await this.repoProductFile.findOneBy({
      productId,
      fileId,
    });
    return this.repoProductFile.remove(productFile);
  }

  async saveProductFile(
    productId: number,
    fileId: number,
    type: string,
    order: number,
  ) {
    const productFile = this.repoProductFile.create({
      fileId,
      productId,
      type,
      order,
    });
    return await this.repoProductFile.save(productFile);
  }

  async getAllProductFiles(productId: number, type: string) {
    return await this.repoProductFile.find({
      where: {
        productId,
        type,
      },
      order: {
        order: 'ASC',
      },
    });
  }

  async publishProduct(productId: number, published: boolean) {
    const product = await this.repo.findOne({
      where: {
        id: productId,
      },
    });
    if (product) {
      product.published = published;
      return this.repo.save(product);
    }
    throw new NotFoundException('Product not found!');
  }

  async updateProduct(productId: number, body: DeepPartial<Product>) {
    const obj = await this.repo.findOne({
      where: {
        id: productId,
      },
    });
    if (obj) {
      return this.repo.update(
        {
          id: productId,
        },
        body,
      );
    }
    throw new NotFoundException('Product not found');
  }

  getFiltered(filter: any, take: number, skip: number) {
    return this.repo.findAndCount({
      where: {
        title: filter.title ? ILike(`%${filter.title}%`) : undefined,
        description: filter.description
          ? ILike(`%${filter.description}%`)
          : undefined,
        category:
          filter.categories?.length > 0 ? In(filter.categories) : undefined,
        published: true,
      },
      order: {},
      take,
      skip,
    });
  }

  getIds(ids: string) {
    let idsAr = [];
    if (ids) {
      if (ids.includes(',')) {
        idsAr = ids.split(',').map((t) => +t.trim());
      } else {
        idsAr = [+ids.trim()];
      }
    }
    return idsAr;
  }

  findOneById(id: number) {
    if (!id) {
      return null;
    }
    return this.repo.findOneBy({ id });
  }

  async removeProduct(id: number) {
    const product = await this.findOneById(id);
    if (product) return this.repo.remove(product);
    throw new NotFoundException('Product not found!');
  }

  getAll(take: number, skip: number) {
    return this.repo.findAndCount({
      take,
      skip,
    });
  }

  getAllProductsForIds(ids: number[], take: number, skip: number) {
    return this.repo.findAndCount({
      where: {
        id: In(ids),
      },
      order: {},
      take,
      skip,
    });
  }

  getAllForCategory(category: number, take: number, skip: number) {
    return this.repo.findAndCount({
      where: {
        published: true,
        category,
      },
      order: {},
      take,
      skip,
    });
  }

  getAllPublished(take: number, skip: number) {
    return this.repo.findAndCount({
      where: {
        published: true,
      },
      order: {},
      take,
      skip,
    });
  }

  getAllNotPublished(take: number, skip: number) {
    return this.repo.findAndCount({
      where: {
        published: false,
      },
      order: {},
      take,
      skip,
    });
  }

  getProduct(id: number) {
    return this.findOneById(id);
  }

  getProducts(ids: number[]) {
    return this.repo.findAndCount({
      where: {
        id: In(ids),
      },
    });
  }
}
