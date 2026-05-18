import { MESSAGES } from '@constants/messages';
import { Injectable } from '@nestjs/common';

@Injectable()
export class AppService {
    getHello(): string {
        return MESSAGES.app.hello;
    }
}
