import { Controller, Get, Post, Body, Patch, Param, Delete, Req, UseGuards, ParseIntPipe } from '@nestjs/common';
import { ProfileService } from './profile.service';
import { UpdateProfileDto } from './dto/update-profile.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { GetUser } from '../auth/decorators/get-user.decorator';

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
@Get(':userId')
getProfileByUserId(
   @GetUser() currentUser: any,
  @Param('userId', ParseIntPipe) userId: number,) 
  {
  return this.profileService.getProfileByUserId(currentUser, userId);
 }
}