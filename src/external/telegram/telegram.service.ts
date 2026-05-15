import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@src/tools/config';

/**
 * Telegram Bot API integration stub.
 *
 * In a real application this would use `telegraf` or the raw HTTP API.
 * Isolates Telegram-specific types from business modules.
 */
@Injectable()
export class TelegramService {
  private readonly logger = new Logger(TelegramService.name);

  constructor(private readonly config: ConfigService) {}

  /**
   * Sends a text message to a Telegram chat.
   */
  async sendMessage(params: {
    chatId: string;
    text: string;
    parseMode?: 'HTML' | 'MarkdownV2';
  }): Promise<{ messageId: string }> {
    this.logger.log('Sending Telegram message', {
      chatId: params.chatId,
      textLength: params.text.length,
    });

    // In production:
    //   const msg = await this.bot.telegram.sendMessage(params.chatId, params.text, {
    //     parse_mode: params.parseMode,
    //   });

    return {
      messageId: `tg_stub_${Date.now()}`,
    };
  }

  /**
   * Sends a notification to a configured admin channel.
   */
  async notifyAdmin(title: string, body: string): Promise<void> {
    const adminChatId = process.env['TELEGRAM_ADMIN_CHAT_ID'] ?? 'stub-admin';

    const text = [`<b>${title}</b>`, '', body].join('\n');

    await this.sendMessage({
      chatId: adminChatId,
      text,
      parseMode: 'HTML',
    });

    this.logger.log('Admin notification sent', { title });
  }

  /**
   * Verifies a Telegram webhook/initData signature.
   */
  verifyInitData(
    initData: string,
  ): { userId: string; valid: boolean } {
    this.logger.log('Verifying Telegram initData');

    // In production: validate the HMAC signature using the bot token

    return {
      userId: 'tg_user_stub',
      valid: true,
    };
  }
}
