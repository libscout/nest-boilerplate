import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@src/tools/config';

/**
 * Stripe integration stub.
 *
 * In a real application this would use the official `stripe` npm package.
 * The purpose here is to demonstrate how to isolate third-party SDKs
 * and expose an application-friendly API.
 */
@Injectable()
export class StripeService {
  private readonly logger = new Logger(StripeService.name);

  constructor(private readonly config: ConfigService) {}

  /**
   * Creates a checkout session for the given price.
   */
  async createCheckoutSession(params: {
    customerEmail: string;
    priceId: string;
    successUrl: string;
    cancelUrl: string;
  }): Promise<{ sessionId: string; url: string }> {
    this.logger.log('Creating Stripe checkout session', params);

    // In production this would call:
    //   const session = await this.stripe.checkout.sessions.create({ ... })

    return {
      sessionId: `cs_stub_${Date.now()}`,
      url: `https://checkout.stripe.com/stub?session=cs_stub_${Date.now()}`,
    };
  }

  /**
   * Verifies a Stripe webhook signature.
   */
  verifyWebhookSignature(
    payload: Buffer,
    signature: string,
  ): { type: string; data: Record<string, unknown> } {
    this.logger.log('Verifying Stripe webhook signature');

    // In production: this.stripe.webhooks.constructEvent(...)

    return {
      type: 'checkout.session.completed',
      data: { stub: true },
    };
  }

  /**
   * Creates a Stripe customer.
   */
  async createCustomer(params: {
    email: string;
    name: string;
  }): Promise<{ customerId: string }> {
    this.logger.log('Creating Stripe customer', params);

    return {
      customerId: `cus_stub_${Date.now()}`,
    };
  }
}
