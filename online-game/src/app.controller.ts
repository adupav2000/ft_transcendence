import { Controller, Get, Post, Request, UseGuards } from '@nestjs/common';

@Controller()
export class AppController {
  constructor() {}

  @Get()
  getProfile() {
    return "Je te vois";
  }
}