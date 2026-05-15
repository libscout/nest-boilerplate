import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@src/tools/config';

/**
 * AWS SDK integration stub.
 *
 * In a real application this would use `@aws-sdk/*` packages.
 * Isolates AWS-specific types and APIs from business modules.
 */
@Injectable()
export class AwsService {
  private readonly logger = new Logger(AwsService.name);

  constructor(private readonly config: ConfigService) {}

  /**
   * Generates a pre-signed URL for uploading a file to S3.
   */
  async generateUploadUrl(params: {
    bucket: string;
    key: string;
    expiresInSeconds?: number;
  }): Promise<{ url: string; expiresAt: Date }> {
    const ttl = params.expiresInSeconds ?? 300;
    const expiresAt = new Date(Date.now() + ttl * 1000);

    this.logger.log('Generating S3 pre-signed upload URL', {
      bucket: params.bucket,
      key: params.key,
      ttl,
    });

    // In production:
    //   const command = new PutObjectCommand({ Bucket: params.bucket, Key: params.key });
    //   const url = await getSignedUrl(this.s3Client, command, { expiresIn: ttl });

    return {
      url: `https://${params.bucket}.s3.amazonaws.com/${params.key}?stub-signed`,
      expiresAt,
    };
  }

  /**
   * Sends an email via SES.
   */
  async sendEmail(params: {
    to: string;
    subject: string;
    body: string;
  }): Promise<{ messageId: string }> {
    this.logger.log('Sending email via SES', {
      to: params.to,
      subject: params.subject,
    });

    // In production: this.ses.sendEmail({ ... })

    return {
      messageId: `ses_stub_${Date.now()}`,
    };
  }

  /**
   * Publishes a message to an SNS topic.
   */
  async publishToTopic(params: {
    topicArn: string;
    message: Record<string, unknown>;
  }): Promise<{ messageId: string }> {
    this.logger.log('Publishing to SNS topic', {
      topicArn: params.topicArn,
    });

    // In production: this.sns.publish({ ... })

    return {
      messageId: `sns_stub_${Date.now()}`,
    };
  }
}
