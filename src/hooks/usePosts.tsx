import { useState, useEffect, useCallback } from "react";
import { postService } from "../services/postsService";
import type { Post } from "../types";

interface UsePostsReturn {
  posts: Post[];
  loading: boolean;
  error: string | null;
  pagination: {
    currentPage: number;
    totalPages: number;
    totalPosts: number;
    hasNextPage: boolean;
    hasPrevPage: boolean;
  } | null;
  refetch: () => Promise<void>;
  loadMore: () => Promise<void>;
  canLoadMore: boolean;
}

interface UsePostsOptions {
  page?: number;
  limit?: number;
  sort?: "latest" | "popular" | "oldest";
  tag?: string;
  search?: string;
  author?: string;
}

export const usePosts = (options: UsePostsOptions = {}): UsePostsReturn => {
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [pagination, setPagination] =
    useState<UsePostsReturn["pagination"]>(null);
  const [currentPage, setCurrentPage] = useState(1);

  const fetchPosts = useCallback(
    async (page: number = 1, append: boolean = false) => {
      try {
        if (!append) {
          setLoading(true);
        }
        setError(null);

        const response = await postService.getAllPosts({
          ...options,
          page,
          limit: options.limit || 10,
        });

        if (response.success) {
          if (append) {
            setPosts((prev) => [...prev, ...response.data.posts]);
          } else {
            setPosts(response.data.posts);
          }
          setPagination(response.data.pagination);
          setCurrentPage(page);
        }
      } catch (err: unknown) {
        const error = err as { response?: { data?: { message?: string } } };
        const errorMessage =
          error.response?.data?.message || "Failed to fetch posts";
        setError(errorMessage);
        console.error("Fetch posts error:", error);
      } finally {
        setLoading(false);
      }
    },
    [options]
  );

  const refetch = useCallback(async () => {
    await fetchPosts(1, false);
  }, [fetchPosts]);

  const loadMore = useCallback(async () => {
    if (pagination?.hasNextPage) {
      await fetchPosts(currentPage + 1, true);
    }
  }, [fetchPosts, pagination, currentPage]);

  useEffect(() => {
    fetchPosts();
  }, [fetchPosts]);

  return {
    posts,
    loading,
    error,
    pagination,
    refetch,
    loadMore,
    canLoadMore: pagination?.hasNextPage || false,
  };
};
