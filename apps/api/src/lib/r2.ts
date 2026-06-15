import { S3Client, PutObjectCommand } from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
import { nanoid } from 'nanoid';

const accountId = process.env.R2_ACCOUNT_ID || '';
const accessKeyId = process.env.R2_ACCESS_KEY_ID || '';
const secretAccessKey = process.env.R2_SECRET_ACCESS_KEY || '';
const bucketName = process.env.R2_BUCKET_NAME || 'makerspace-uploads';
const publicUrl = process.env.R2_PUBLIC_URL || '';

const s3 = new S3Client({
  region: 'auto',
  endpoint: `https://${accountId}.r2.cloudflarestorage.com`,
  credentials: { accessKeyId, secretAccessKey },
});

export async function getPresignedUploadUrl(
  filename: string,
  contentType: string,
  folder = 'uploads'
) {
  const key = `${folder}/${nanoid()}-${filename.replace(/[^a-zA-Z0-9._-]/g, '_')}`;

  const command = new PutObjectCommand({
    Bucket: bucketName,
    Key: key,
    ContentType: contentType,
  });

  const uploadUrl = await getSignedUrl(s3, command, { expiresIn: 3600 });
  const publicFileUrl = publicUrl ? `${publicUrl}/${key}` : uploadUrl.split('?')[0];

  return { uploadUrl, publicUrl: publicFileUrl, key };
}

export function isR2Configured(): boolean {
  return Boolean(accountId && accessKeyId && secretAccessKey);
}
