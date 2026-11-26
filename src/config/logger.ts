import cluster from 'node:cluster';
import * as winston from 'winston';
import 'winston-daily-rotate-file';
import { WinstonModule } from 'nest-winston';

const getWorkerLabel = (): string =>
    cluster.isWorker && cluster.worker ? `W${cluster.worker.id}|PID:${process.pid}` : `Primary|PID:${process.pid}`;

const processMetadataFormat = winston.format((info) => {
    info.pid = process.pid;
    info.workerId = cluster.isWorker && cluster.worker ? cluster.worker.id : 'primary';
    return info;
});

const transports = [
    new winston.transports.Console({
        format: winston.format.combine(
            winston.format.timestamp(),
            winston.format.ms(),
            winston.format.colorize(),
            winston.format.printf(({ timestamp, level, message, context, ms }) => {
                const contextLabel = typeof context === 'string' && context.length > 0 ? `[${context}] ` : '';
                return `${timestamp} [${getWorkerLabel()}] [${level}] ${contextLabel}${message} ${ms}`;
            })
        )
    }),
    new winston.transports.DailyRotateFile({
        filename: 'logs/application-%DATE%.log',
        datePattern: 'YYYY-MM-DD',
        zippedArchive: true,
        maxSize: '20m',
        maxFiles: '14d',
        format: winston.format.combine(processMetadataFormat(), winston.format.timestamp(), winston.format.json())
    }),
    new winston.transports.DailyRotateFile({
        filename: 'logs/error-%DATE%.log',
        level: 'error',
        datePattern: 'YYYY-MM-DD',
        zippedArchive: true,
        maxSize: '20m',
        maxFiles: '30d',
        format: winston.format.combine(processMetadataFormat(), winston.format.timestamp(), winston.format.json())
    })
];

export const logger = WinstonModule.createLogger({
    transports
});
