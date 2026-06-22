import { S3Client, GetObjectCommand, DeleteObjectCommand } from "@aws-sdk/client-s3";
import { Upload } from "@aws-sdk/lib-storage";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import fs from "fs";
import path from "path";
import { Readable, PassThrough } from "stream";
import { mkdir } from "fs/promises";

export interface BackupStorageProvider {
  uploadStream(key: string, stream: Readable | PassThrough): Promise<void>;
  downloadStream(key: string): Promise<Readable>;
  deleteObject(key: string): Promise<void>;
  getSignedUrl(key: string, expiresIn?: number): Promise<string>;
}

class LocalStorageProvider implements BackupStorageProvider {
  private baseDir: string;

  constructor() {
    this.baseDir = path.join(process.cwd(), "public", "backups");
    // Ensure directory exists synchronously during init if possible, or gracefully handle
    if (!fs.existsSync(this.baseDir)) {
      fs.mkdirSync(this.baseDir, { recursive: true });
    }
  }

  async uploadStream(key: string, stream: Readable | PassThrough): Promise<void> {
    const filePath = path.join(this.baseDir, key);
    await mkdir(path.dirname(filePath), { recursive: true });
    
    return new Promise((resolve, reject) => {
      const writeStream = fs.createWriteStream(filePath);
      stream.pipe(writeStream);
      writeStream.on("finish", resolve);
      writeStream.on("error", reject);
      stream.on("error", reject);
    });
  }

  async downloadStream(key: string): Promise<Readable> {
    const filePath = path.join(this.baseDir, key);
    if (!fs.existsSync(filePath)) {
      throw new Error(`File not found: ${key}`);
    }
    return fs.createReadStream(filePath);
  }

  async deleteObject(key: string): Promise<void> {
    const filePath = path.join(this.baseDir, key);
    if (fs.existsSync(filePath)) {
      await fs.promises.unlink(filePath);
    }
  }

  async getSignedUrl(key: string, expiresIn = 3600): Promise<string> {
    // For local dev, we just return the local API route or static path
    // In a real local provider, you'd serve it via an API wrapper
    return `/backups/${key}`;
  }
}

class S3CompatibleProvider implements BackupStorageProvider {
  private client: S3Client;
  private bucket: string;

  constructor() {
    this.bucket = process.env.BACKUP_BUCKET_NAME || "orbitdine-backups";
    this.client = new S3Client({
      region: process.env.AWS_REGION || "us-east-1",
      credentials: {
        accessKeyId: process.env.AWS_ACCESS_KEY_ID!,
        secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY!,
      },
      endpoint: process.env.S3_ENDPOINT, // For R2 or MinIO
    });
  }

  async uploadStream(key: string, stream: Readable | PassThrough): Promise<void> {
    const upload = new Upload({
      client: this.client,
      params: {
        Bucket: this.bucket,
        Key: key,
        Body: stream,
      },
    });

    await upload.done();
  }

  async downloadStream(key: string): Promise<Readable> {
    const command = new GetObjectCommand({
      Bucket: this.bucket,
      Key: key,
    });
    
    const response = await this.client.send(command);
    if (!response.Body) {
      throw new Error("Empty response body from S3");
    }
    
    // AWS SDK v3 Body is an SDKStream, which is generally compatible with Node Readable in Node.js env
    return response.Body as unknown as Readable;
  }

  async deleteObject(key: string): Promise<void> {
    const command = new DeleteObjectCommand({
      Bucket: this.bucket,
      Key: key,
    });
    await this.client.send(command);
  }

  async getSignedUrl(key: string, expiresIn = 3600): Promise<string> {
    const command = new GetObjectCommand({
      Bucket: this.bucket,
      Key: key,
    });
    return getSignedUrl(this.client, command, { expiresIn });
  }
}

export const getBackupStorage = (): BackupStorageProvider => {
  if (process.env.AWS_ACCESS_KEY_ID && process.env.AWS_SECRET_ACCESS_KEY) {
    return new S3CompatibleProvider();
  }
  return new LocalStorageProvider();
};
