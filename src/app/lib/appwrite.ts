import { Client, Databases, Storage, Account, ID } from 'appwrite';

const client = new Client()
  .setEndpoint('https://fra.cloud.appwrite.io/v1')
  .setProject('6ace9263003199cf4b6f');

export const databases = new Databases(client);
export const storage = new Storage(client);
export const account = new Account(client);
export { ID };

// المعرفات الدقيقة والمصححة من لوحة Appwrite
export const DB_ID = '6ace931c00205a66e468';
export const TABLE_ID = '6ace935d0015975c804b';
export const BUCKET_ID = '6ace9b9f00215496e643';