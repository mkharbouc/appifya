import { Client, Databases, Storage, Account } from 'appwrite';

const client = new Client();

const endpoint = process.env.NEXT_PUBLIC_APPWRITE_ENDPOINT || 'https://cloud.appwrite.io/v1';
const projectId = process.env.NEXT_PUBLIC_APPWRITE_PROJECT_ID || '';

if (endpoint && projectId) {
  client.setEndpoint(endpoint).setProject(projectId);
}

export const databases = new Databases(client);
export const storage = new Storage(client);
export const account = new Account(client);
export { client };
