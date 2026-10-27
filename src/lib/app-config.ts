import { Client, Databases, Storage, Account } from 'appwrite';

function cleanEnv(val: string | undefined, fallback: string = ''): string {
  if (!val) return fallback;
  return val.trim().replace(/^["']|["']$/g, '');
}

const endpoint = cleanEnv(process.env.NEXT_PUBLIC_APPWRITE_ENDPOINT, 'https://fra.cloud.appwrite.io/v1');
const projectId = cleanEnv(process.env.NEXT_PUBLIC_APPWRITE_PROJECT_ID, '');
const client = new Client().setEndpoint(endpoint).setProject(projectId);

export const account = new Account(client);
export const databases = new Databases(client);
export const storage = new Storage(client);

export const DB_ID = cleanEnv(process.env.NEXT_PUBLIC_APPWRITE_DATABASE_ID, '');
export const TABLE_ID = cleanEnv(process.env.NEXT_PUBLIC_APPWRITE_TABLE_ID, '');
export const BUCKET_ID = cleanEnv(process.env.NEXT_PUBLIC_APPWRITE_BUCKET_ID, '');

export const appwriteConfigMissing = [
  ['NEXT_PUBLIC_APPWRITE_PROJECT_ID', projectId],
  ['NEXT_PUBLIC_APPWRITE_DATABASE_ID', DB_ID],
  ['NEXT_PUBLIC_APPWRITE_TABLE_ID', TABLE_ID],
  ['NEXT_PUBLIC_APPWRITE_BUCKET_ID', BUCKET_ID],
].filter(([, value]) => !value).map(([name]) => name);

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
