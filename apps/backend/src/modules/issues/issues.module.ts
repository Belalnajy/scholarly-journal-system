import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { IssuesService } from './issues.service';
import { IssuesController } from './issues.controller';
import { Issue } from '../../database/entities/issue.entity';
import { Article } from '../../database/entities/article.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Issue, Article])],
  controllers: [IssuesController],
  providers: [IssuesService],
  exports: [IssuesService],
})
export class IssuesModule {}
