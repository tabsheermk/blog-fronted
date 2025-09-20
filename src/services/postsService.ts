import { apiService } from "./api";
import type { Post } from "../types/index.ts";

export interface PostsResponse {
  success: boolean;
  data: {
    posts: Post[];
    pagination: {
      currentPage: number;
      totalPages: number;
      totalPosts: number;
      hasNextPage: boolean;
      hasPrevPage: boolean;
    };
  };
}

export interface CreatePostData {
  title: string;
  content: string;
  tags: string[];
}

class PostService {
  async getAllPosts(params?: {
    page?: number;
    limit?: number;
    sort?: "latest" | "popular" | "oldest";
    tag?: string;
    search?: string;
    author?: string;
  }): Promise<PostsResponse> {
    const queryParams = new URLSearchParams();

    if (params) {
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined) {
          queryParams.append(key, value.toString());
        }
      });
    }

    const queryString = queryParams.toString();
    const url = queryString ? `/posts?${queryString}` : "/posts";

    return await apiService.get<PostsResponse>(url);
  }

  async getPostBySlug(
    slug: string
  ): Promise<{ success: boolean; data: { post: Post } }> {
    return await apiService.get(`/posts/${slug}`);
  }

  async createPost(
    data: CreatePostData
  ): Promise<{ success: boolean; data: { post: Post } }> {
    return await apiService.post("/posts", data);
  }

  async updatePost(
    id: string,
    data: Partial<CreatePostData>
  ): Promise<{ success: boolean; data: { post: Post } }> {
    return await apiService.put(`/posts/${id}`, data);
  }

  async deletePost(id: string): Promise<{ success: boolean; message: string }> {
    return await apiService.delete(`/posts/${id}`);
  }

  async votePost(
    id: string,
    voteType: "upvote" | "downvote"
  ): Promise<{
    success: boolean;
    data: { votes: unknown; userVote: string | null };
  }> {
    return await apiService.post(`/posts/${id}/vote`, { voteType });
  }

  async getMyPosts(params?: {
    page?: number;
    limit?: number;
  }): Promise<PostsResponse> {
    const queryParams = new URLSearchParams();

    if (params) {
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined) {
          queryParams.append(key, value.toString());
        }
      });
    }

    const queryString = queryParams.toString();
    const url = queryString
      ? `/posts/my-posts?${queryString}`
      : "/posts/my-posts";

    return await apiService.get<PostsResponse>(url);
  }
}

export const postService = new PostService();
