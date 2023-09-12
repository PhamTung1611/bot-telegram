import { Controller, Post, Body } from '@nestjs/common';
import { TelegramBotService } from './telegram.service';

@Controller('telegram')
export class TelegramBotController {
  constructor(private readonly telegramBotService: TelegramBotService) {}
}
