import { Injectable, Logger } from '@nestjs/common';
import cluster from 'node:cluster';


@Injectable()
export class AppClusterService {
    private readonly isClusterMode: boolean;
    private readonly numCPUs: number;

    constructor() {
        this.isClusterMode = process.env.CLUSTER_MODE === 'true';
        this.numCPUs = require('node:os').cpus().length;
    }

    static InitializeCluster(functionToRun: () => Promise<void>) {
        if (process.env.CLUSTER_MODE === 'true' && cluster.isPrimary) {
            const numCPUs = require('os').cpus().length;
            Logger.log(`Master process ${process.pid} is running in cluster mode with ${numCPUs} CPUs.`);

            for (let i = 0; i < numCPUs; i++) {
                cluster.fork();
            }

            cluster.on('exit', (worker, code, signal) => {
                Logger.log(`Worker ${worker.process.pid} died. Forking a new worker...`);
                cluster.fork();
            });
        }
        else{
            functionToRun().catch((error) => {
                Logger.error(`Error during application bootstrap: ${error.message}`, error.stack);
                process.exit(1);
            });
        }
    }
    public getClusterInfo() {
        return {
            isClusterMode: this.isClusterMode,
            numCPUs: this.numCPUs,
            isMaster: cluster.isPrimary,
            isWorker: cluster.isWorker,
            workerId: cluster.worker?.id || null,
        };
    }
}