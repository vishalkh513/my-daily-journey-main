import { ObjectId } from 'mongodb';

export interface Post {
  _id?: ObjectId;
  title: string;
  content: string;
  author: string;
  createdAt: Date;
  updatedAt: Date;
  tags?: string[];
  published?: boolean;
  mood?: string;
}

export interface Mark {
  _id?: ObjectId;
  userId: string;
  markType: string;
  value: number;
  date: Date;
  notes?: string;
}

export interface User {
  _id?: ObjectId;
  email: string;
  username: string;
  createdAt: Date;
  updatedAt: Date;
  lastLogin?: Date;
}
