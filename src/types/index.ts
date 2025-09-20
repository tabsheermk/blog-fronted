// Basic types to get started
export interface User {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  avatar?: string;
  role: "user" | "admin";
}

export interface Post {
  _id: string;
  title: string;
  content: string;
  tags: string[];
  author: string;
  authorDetails: {
    firstName: string;
    lastName: string;
    email: string;
  };
  votes: {
    upvotes: number;
    downvotes: number;
    score: number;
  };
  slug: string;
  views: number;
  commentCount: number;
  readTime: number;
  createdAt: string;
  updatedAt: string;
}
