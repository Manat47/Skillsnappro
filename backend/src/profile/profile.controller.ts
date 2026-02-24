import { Controller, Get, Post, Body, Patch, Param, Delete, Req, UseGuards, ParseIntPipe } from '@nestjs/common';
import { ProfileService } from './profile.service';
import { UpdateProfileDto } from './dto/update-profile.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@Controller('profile')
export class ProfileController {
  constructor(private readonly profileService: ProfileService) {}

@UseGuards(JwtAuthGuard)
@Get('me')
async getMyProfile(@Req() req: any) {
  console.log('ข้อมูลที่แกะได้จาก Token:', req.user);
  return this.profileService.getMyProfile(req.user.userId);
}

@UseGuards(JwtAuthGuard)
@Patch('me')
async updateMyProfile(@Req() req: any, @Body() dto: UpdateProfileDto) {
  return this.profileService.updateMyProfile(req.user.userId, dto);
 }

@UseGuards(JwtAuthGuard)
@Get(':userId')
getProfileByUserId(
  @Req() req: any,
  @Param('userId', ParseIntPipe) userId: number,) {
  return this.profileService.getProfileByUserId(req.user, userId);
 }
}