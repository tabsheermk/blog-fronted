import { apiService } from "./api";
import type { Comment } from "../types";

export interface CommentsResponse {
  success: boolean;
  data: {
    comments: Comment[];
    pagination: {
      currentPage: number;
      totalPages: number;
      totalComments: number;
      hasNextPage: boolean;
      hasPrevPage: boolean;
    };
  };
}

export interface CreateCommentData {
  content: string;
  parentCommentId?: string;
}

class CommentService {
  async getPostComments(
    postId: string,
    params?: {
      page?: number;
      limit?: number;
      sort?: "newest" | "oldest" | "popular";
    }
  ): Promise<CommentsResponse> {
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
      ? `/posts/${postId}/comments?${queryString}`
      : `/posts/${postId}/comments`;

    return await apiService.get<CommentsResponse>(url);
  }

  async addComment(
    postId: string,
    data: CreateCommentData
  ): Promise<{ success: boolean; data: { comment: Comment } }> {
    return await apiService.post(`/posts/${postId}/comments`, data);
  }

  async getCommentReplies(
    commentId: string,
    params?: { page?: number; limit?: number }
  ): Promise<CommentsResponse> {
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
      ? `/comments/${commentId}/replies?${queryString}`
      : `/comments/${commentId}/replies`;

    return await apiService.get<CommentsResponse>(url);
  }

  async updateComment(
    commentId: string,
    data: { content: string }
  ): Promise<{ success: boolean; data: { comment: Comment } }> {
    return await apiService.put(`/comments/${commentId}`, data);
  }

  async deleteComment(
    commentId: string
  ): Promise<{ success: boolean; message: string }> {
    return await apiService.delete(`/comments/${commentId}`);
  }

  async voteComment(
    commentId: string,
    voteType: "upvote" | "downvote"
  ): Promise<{
    success: boolean;
    data: { votes: unknown; userVote: string | null };
  }> {
    return await apiService.post(`/comments/${commentId}/vote`, { voteType });
  }
}

export const commentService = new CommentService();
