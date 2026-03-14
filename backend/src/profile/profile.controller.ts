import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards, ParseIntPipe, Put } from '@nestjs/common';
import { ProfileService } from './profile.service';
import { UpdateProfileDto } from './dto/update-profile.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { GetUser } from '../auth/decorators/get-user.decorator';
import { UpdateProfileSkillsDto } from './dto/update-profile-skills.dto';
import { AddProfileSkillDto } from './dto/add-profile-skill.dto';

@Controller('profile')
export class ProfileController {
  constructor(private readonly profileService: ProfileService) {}

@UseGuards(JwtAuthGuard)
@Get('me')
async getMyProfile(@GetUser('userId') userId: number) {
  return this.profileService.getMyProfile(userId);
}

@UseGuards(JwtAuthGuard)
@Patch('me')
async updateMyProfile(
   @GetUser('userId') userId: number,
   @Body() dto: UpdateProfileDto,
) {
  return this.profileService.updateMyProfile(userId, dto);
 }

@UseGuards(JwtAuthGuard)
@Get('me/skills')
async getMyProfileSkills(@GetUser('userId') userId: number) {
  return this.profileService.getMyProfileSkills(userId);
}

@UseGuards(JwtAuthGuard)
@Put('me/skills')
async replaceMyProfileSkills(
  @GetUser('userId') userId: number,
  @Body() dto: UpdateProfileSkillsDto,
) {
  return this.profileService.replaceMyProfileSkills(userId, dto);
}

@UseGuards(JwtAuthGuard)
@Post('me/skills')
async addMyProfileSkill(
  @GetUser('userId') userId: number,
  @Body() dto: AddProfileSkillDto,
) {
  return this.profileService.addMyProfileSkill(userId, dto.skillId);
}

@UseGuards(JwtAuthGuard)
@Delete('me/skills/:skillId')
async removeMyProfileSkill(
  @GetUser('userId') userId: number,
  @Param('skillId', ParseIntPipe) skillId: number,
) {
  return this.profileService.removeMyProfileSkill(userId, skillId);
}

@UseGuards(JwtAuthGuard)
@Get(':userId')
getProfileByUserId(
   @GetUser() currentUser: any,
  @Param('userId', ParseIntPipe) userId: number,) 
  {
  return this.profileService.getProfileByUserId(currentUser, userId);
 }
}
