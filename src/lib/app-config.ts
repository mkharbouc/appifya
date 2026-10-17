import { Client, Databases, Storage, Account } from 'appwrite';

function requiredEnv(name: string): string {
  const value = process.env[name];
  if (!value) throw new Error(`${name} is missing.`);
  return value;
}

const endpoint = requiredEnv('NEXT_PUBLIC_APPWRITE_ENDPOINT');
const projectId = requiredEnv('NEXT_PUBLIC_APPWRITE_PROJECT_ID');
const client = new Client().setEndpoint(endpoint).setProject(projectId);

export const account = new Account(client);
export const databases = new Databases(client);
export const storage = new Storage(client);

export const DB_ID = requiredEnv('NEXT_PUBLIC_APPWRITE_DATABASE_ID');
export const TABLE_ID = requiredEnv('NEXT_PUBLIC_APPWRITE_TABLE_ID');
export const BUCKET_ID = requiredEnv('NEXT_PUBLIC_APPWRITE_BUCKET_ID');

export function isValidPublicUrl(value: unknown): value is string {
  if (typeof value !== 'string' || value.length > 2048) return false;

  try {
    const url = new URL(value);
    return (
      url.protocol === 'https:' &&
      url.username === '' &&
      url.password === '' &&
      !['localhost', '127.0.0.1', '0.0.0.0', '::1'].includes(url.hostname)
    );
  } catch {
    return false;
  }
}

export function normalizePublicUrl(value: string): string {
  const candidate = /^https?:\/\//i.test(value) ? value : `https://${value}`;
  const url = new URL(candidate);

  if (!isValidPublicUrl(url.toString())) {
    throw new Error('Please provide a valid HTTPS URL.');
  }

  return url.toString();
}

export function getErrorMessage(error: unknown, fallback: string): string {
  return error instanceof Error && error.message ? error.message : fallback;
}
