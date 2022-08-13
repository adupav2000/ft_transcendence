import { Controller, Get, Post, Request, UseGuards } from '@nestjs/common';

@Controller()
export class AppController {
  constructor() {}

  @Get()
  getProfile(@Request() req) {
    return req;
  }
}