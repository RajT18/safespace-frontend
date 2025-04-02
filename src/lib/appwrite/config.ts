import { Client, Account, Databases, Storage, Avatars } from "appwrite";




export const appwriteConfig = {
  url: 'https://cloud.appwrite.io/v1',
  projectId: '67b4dacb0039270516d4',
  databaseId: '67b4db05000267339615',
  storageId: '67b4db17000a803b7eb7',
  userCollectionId: '67b4de450017b869c20e',
  postCollectionId: '67b4de3e0033150d4c45',
  savesCollectionId: '67b4de48001f622e2283',
  followersCollectionId: '67b4ecd40001831132f5',
  messagesCollectionId: '67b7a351001bf83310f4',
  chatRoomsCollectionId: '67b7c07a00114efe2562'
};

export const client = new Client();

client.setEndpoint(appwriteConfig.url);
client.setProject(appwriteConfig.projectId);

export const account = new Account(client);
export const databases = new Databases(client);
export const storage = new Storage(client);
export const avatars = new Avatars(client);
