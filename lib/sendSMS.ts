import axios from 'axios';
import crypto from 'crypto';

const accessKey = process.env.NAVER_CLOUD_ACCESS_KEY!;
const secretKey = process.env.NAVER_CLOUD_SECRET_KEY!;
const serviceId = process.env.NAVER_CLOUD_SERVICE_ID!;
const senderPhone = process.env.SENDER_PHONE_NUMBER!;

if (!accessKey || !secretKey || !serviceId || !senderPhone) {
  throw new Error('Missing required environment variables for SMS service');
}

export async function sendSMS(recipientPhone: string, content: string) {
  const timestamp = Date.now().toString();
  const signature = makeSignature(timestamp);

  try {
    const response = await axios.post(
      `https://sens.apigw.ntruss.com/sms/v2/services/${serviceId}/messages`,
      {
        type: 'SMS',
        from: senderPhone,
        content: content,
        messages: [{ to: recipientPhone }],
      },
      {
        headers: {
          'Content-Type': 'application/json',
          'x-ncp-apigw-timestamp': timestamp,
          'x-ncp-iam-access-key': accessKey,
          'x-ncp-apigw-signature-v2': signature,
        },
      }
    );

    console.log('SMS sent successfully:', response.data);
    return response.data;
  } catch (error) {
    console.error('Failed to send SMS:', error);
    throw error;
  }
}

function makeSignature(timestamp: string) {
  const space = " ";
  const newLine = "\n";
  const method = "POST";
  const url = `/sms/v2/services/${serviceId}/messages`;

  const hmac = crypto.createHmac('sha256', secretKey);
  hmac.update(method);
  hmac.update(space);
  hmac.update(url);
  hmac.update(newLine);
  hmac.update(timestamp);
  hmac.update(newLine);
  hmac.update(accessKey);

  return hmac.digest('base64');
}

