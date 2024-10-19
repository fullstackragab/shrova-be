import { Injectable } from '@nestjs/common';
import { Newsletter } from './newsletter.entity';
import { DeepPartial, Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';

@Injectable()
export class NewsletterService {
  constructor(
    @InjectRepository(Newsletter)
    private repo: Repository<Newsletter>,
  ) {}

  addToNewsLetter(newsletter: DeepPartial<Newsletter>) {
    return this.repo.save(newsletter);
  }

  async unsubscribe(email: string) {
    const found = await this.repo.findBy({ email });
    if (found) return this.repo.remove(found);
  }
}
