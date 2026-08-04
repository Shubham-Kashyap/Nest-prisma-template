import { bullmqConfig } from "@config/bullmq";
import { QUEUE_NAMES } from "@constants/queue";
import { BullModule } from "@nestjs/bullmq";
import { Module, OnModuleDestroy } from "@nestjs/common";
import { EmailProducer } from "./producers/email.producer";
import { EmailSenderService } from "./services/email-sender.service";
import { DlqReplayService } from "./services/dlq-replay.service";
import { shutdownEmailWorkers } from "./workers/email.worker";


import { BullBoardModule } from "@bull-board/nestjs";
import { ExpressAdapter } from "@bull-board/express";
import { BullMQAdapter } from "@bull-board/api/bullMQAdapter";

const PROVIDERS = [EmailProducer, EmailSenderService, DlqReplayService];
const EXPORTS = [EmailProducer, DlqReplayService];

// Automatically register every queue defined in our constants
const DYNAMIC_QUEUES = Object.values(QUEUE_NAMES).map((name) => ({ name }));

@Module({
    imports: [
        BullModule.forRoot(bullmqConfig),
        BullModule.registerQueue(...DYNAMIC_QUEUES),
        BullBoardModule.forRoot({
            route: '/queues',
            adapter: ExpressAdapter,
        }),
        ...DYNAMIC_QUEUES.map((q) =>
            BullBoardModule.forFeature({
                name: q.name,
                adapter: BullMQAdapter,
            })
        ),
    ],
    controllers: [],
    providers: [...PROVIDERS],
    exports: [...EXPORTS]
})
export default class QueueModule implements OnModuleDestroy {
    async onModuleDestroy() {
        // Automatically orchestrates graceful shutdown of all BullMQ email workers
        // when the NestJS application is terminating.
        await shutdownEmailWorkers();
    }
}