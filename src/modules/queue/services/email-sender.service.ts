import { Injectable, Logger } from '@nestjs/common';
import { circuitBreakerConfig } from '@config/bullmq';

export type ProviderName = 'SES' | 'Sendgrid' | 'Mailgun';

interface ProviderState {
  name: ProviderName;
  failures: number;
  unhealthyUntil: number;
}

@Injectable()
export class EmailSenderService {
  private readonly logger = new Logger(EmailSenderService.name);
  
  private providers: ProviderState[] = [
    { name: 'SES', failures: 0, unhealthyUntil: 0 },
    { name: 'Sendgrid', failures: 0, unhealthyUntil: 0 },
    { name: 'Mailgun', failures: 0, unhealthyUntil: 0 },
  ];

  private readonly MAX_FAILURES = circuitBreakerConfig.MAX_FAILURES;
  private readonly CIRCUIT_OPEN_DURATION_MS = circuitBreakerConfig.CIRCUIT_OPEN_DURATION_MS;


  async sendEmail(to: string, subject: string, body: string) {
    for (const provider of this.providers) {
      // 1. Check Circuit Breaker Status
      if (Date.now() < provider.unhealthyUntil) {
        this.logger.warn(`[CIRCUIT BREAKER] ${provider.name} is OPEN (unhealthy). Skipping...`);
        continue;
      }

      try {
        this.logger.log(`Attempting to send email via ${provider.name} to ${to}`);
        
        // Mock provider sending logic
        await this.mockProviderSend(provider.name);

        // Success: Reset failures and close circuit
        provider.failures = 0;
        provider.unhealthyUntil = 0;
        
        this.logger.log(`Email successfully sent via ${provider.name} -> ${to} | ${subject}`);
        return true;

      } catch (error: any) {
        this.logger.error(`[PROVIDER ERROR] ${provider.name} failed: ${error.message}`);
        
        // 2. Track failures for Circuit Breaker
        // We consider these transient errors for circuit breaking
        provider.failures += 1;

        if (provider.failures >= this.MAX_FAILURES) {
          this.logger.error(`[CIRCUIT BREAKER] Opening circuit for ${provider.name} for ${this.CIRCUIT_OPEN_DURATION_MS / 1000}s`);
          provider.unhealthyUntil = Date.now() + this.CIRCUIT_OPEN_DURATION_MS;
        }

        // Proceed to next provider (Failover)
      }
    }

    // 3. Exhausted all providers
    throw new Error('All providers failed or are currently unhealthy (outage)');
  }

  private async mockProviderSend(providerName: ProviderName) {
    const randomDelay = Math.floor(Math.random() * 500) + 100;
    await new Promise((resolve) => setTimeout(resolve, randomDelay));

    // Simulate 20% failure rate for SES, 10% for Sendgrid, 5% for Mailgun
    const failureRates = { SES: 0.2, Sendgrid: 0.1, Mailgun: 0.05 };
    const randomFailure = Math.random() < failureRates[providerName];

    if (randomFailure) {
      // 10% of the time it's a permanent bounce, 90% it's transient
      if (Math.random() < 0.1) {
        throw new Error('permanent bounce - invalid recipient address');
      } else {
        // Simulate random transient errors
        const errors = ['rate limit exceeded', '503 service unavailable', 'network timeout'];
        const randomError = errors[Math.floor(Math.random() * errors.length)];
        throw new Error(randomError);
      }
    }
  }
}