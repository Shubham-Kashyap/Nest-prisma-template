import { Injectable, Logger } from '@nestjs/common';

import { Job } from 'bullmq';
import { EmailSenderService } from '../services/email-sender.service';

@Injectable()
export default class EmailProcessor {
  private readonly logger = new Logger(EmailProcessor.name);

  constructor(
    private readonly emailSenderService: EmailSenderService,
  ) {}

  async process(job: Job) {
    const { to, subject, body } = job.data;

    this.logger.log(
      `Processing Job ${job.id} -> ${to}`,
    );

    await this.emailSenderService.sendEmail(
      to,
      subject,
      body
    );

    return {
      success: true,
    };
  }
}