import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  ParseIntPipe,
  Patch,
  Post,
  UseGuards,
  Put,
} from '@nestjs/common';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { GetUser } from '../auth/decorators/get-user.decorator';
import { ProjectsService } from './projects.service';
import { CreateProjectDto } from './dto/create-project.dto';
import { UpdateProjectDto } from './dto/update-project.dto';
import { CreateProjectMediaDto } from './dto/create-project-media.dto';
import { UpdateProjectMediaDto } from './dto/update-project-media.dto';
import { UpdateProjectTagsDto } from './dto/update-project-tags.dto';
import { AddProjectMemberDto } from './dto/add-project-member.dto';
import { UpdateProjectMemberRoleDto } from './dto/update-project-member-role.dto';

@UseGuards(JwtAuthGuard)
@Controller('projects')
export class ProjectsController {
  constructor(private readonly projectsService: ProjectsService) { }

  @Post()
  create(@GetUser('userId') userId: number, @Body() dto: CreateProjectDto) {
    return this.projectsService.create(userId, dto);
  }

  @Get('me')
  findMy(@GetUser('userId') userId: number) {
    return this.projectsService.findMy(userId);
  }

  @Get(':id')
  findOne(
    @GetUser('userId') userId: number,
    @Param('id', ParseIntPipe) id: number,
  ) {
    return this.projectsService.findOne(userId, id);
  }

  @Patch(':id')
  update(
    @GetUser('userId') userId: number,
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: UpdateProjectDto,
  ) {
    return this.projectsService.update(userId, id, dto);
  }

  @Delete(':id')
  remove(
    @GetUser('userId') userId: number,
    @Param('id', ParseIntPipe) id: number,
  ) {
    return this.projectsService.remove(userId, id);
  }

  @Get(':id/media')
  listMedia(
    @GetUser('userId') userId: number,
    @Param('id', ParseIntPipe) id: number,
  ) {
    return this.projectsService.listMedia(userId, id);
  }

  @Post(':id/media')
  addMedia(
    @GetUser('userId') userId: number,
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: CreateProjectMediaDto,
  ) {
    return this.projectsService.addMedia(userId, id, dto);
  }

  @Patch(':id/media/:mediaId')
  updateMedia(
    @GetUser('userId') userId: number,
    @Param('id', ParseIntPipe) id: number,
    @Param('mediaId', ParseIntPipe) mediaId: number,
    @Body() dto: UpdateProjectMediaDto,
  ) {
    return this.projectsService.updateMedia(userId, id, mediaId, dto);
  }

  @Delete(':id/media/:mediaId')
  removeMedia(
    @GetUser('userId') userId: number,
    @Param('id', ParseIntPipe) id: number,
    @Param('mediaId', ParseIntPipe) mediaId: number,
  ) {
    return this.projectsService.removeMedia(userId, id, mediaId);
  }

  @Put(':id/tags')
  setTags(
  @GetUser('userId') userId: number,
  @Param('id', ParseIntPipe) id: number,
  @Body() dto: UpdateProjectTagsDto,
  ) {
  return this.projectsService.setTags(userId, id, dto.tagNames);
  }

  @Get(':id/tags')
  getTags(
  @GetUser('userId') userId: number,
  @Param('id', ParseIntPipe) id: number,
) {
  return this.projectsService.getTags(userId, id);
  }

  @Get(':id/members')
listMembers(
  @GetUser('userId') userId: number,
  @Param('id', ParseIntPipe) id: number,
) {
  return this.projectsService.listMembers(userId, id);
}

@Post(':id/members')
addMember(
  @GetUser('userId') userId: number,
  @Param('id', ParseIntPipe) id: number,
  @Body() dto: AddProjectMemberDto,
) {
  return this.projectsService.addMember(userId, id, dto);
}

@Patch(':id/members/:memberId')
updateMemberRole(
  @GetUser('userId') userId: number,
  @Param('id', ParseIntPipe) id: number,
  @Param('memberId', ParseIntPipe) memberId: number,
  @Body() dto: UpdateProjectMemberRoleDto,
) {
  return this.projectsService.updateMemberRole(userId, id, memberId, dto.role);
}

@Delete(':id/members/:memberId')
removeMember(
  @GetUser('userId') userId: number,
  @Param('id', ParseIntPipe) id: number,
  @Param('memberId', ParseIntPipe) memberId: number,
) {
  return this.projectsService.removeMember(userId, id, memberId);
  }
}
