import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { TeamSectionsService } from './team-sections.service';
import { TeamSectionsController } from './team-sections.controller';
import { TeamSection } from '../../database/entities/team-section.entity';

@Module({
  imports: [TypeOrmModule.forFeature([TeamSection])],
  controllers: [TeamSectionsController],
  providers: [TeamSectionsService],
  exports: [TeamSectionsService],
})
export class TeamSectionsModule {}
