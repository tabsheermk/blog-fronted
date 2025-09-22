import React, { useState, useEffect } from "react";
import type { Comment } from "../../types";
import { commentService } from "../../services/commentService";
import CommentForm from "./CommentForm";
import CommentCard from "./CommentCard";
import { showError, showSuccess } from "../../utils/toast";
import { ChatBubbleLeftIcon } from "@heroicons/react/24/outline";

interface CommentSectionProps {
  postId: string;
}

const CommentSection: React.FC<CommentSectionProps> = ({ postId }) => {
  const [comments, setComments] = useState<Comment[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [sortBy, setSortBy] = useState<"newest" | "oldest" | "popular">(
    "newest"
  );
  interface Pagination {
    totalComments: number;
  }
  const [pagination, setPagination] = useState<Pagination | null>(null);

  useEffect(() => {
    fetchComments();
  }, [postId, sortBy]);

  const fetchComments = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await commentService.getPostComments(postId, {
        sort: sortBy,
        limit: 20,
      });
      if (response.success) {
        setComments(response.data.comments);
        setPagination(response.data.pagination);
      }
    } catch (err) {
      const errorMessage =
        (err as { response?: { data?: { message?: string } } })?.response?.data
          ?.message || "Failed to load comments";
      setError(errorMessage);
      console.error("Fetch comments error", err);
    } finally {
      setLoading(false);
    }
  };

  const handleAddComment = async (content: string) => {
    try {
      const response = await commentService.addComment(postId, { content });
      if (response.success) {
        setComments((prev) => [response.data.comment, ...prev]);
        showSuccess("Comment added successfully!");
      }
    } catch (err) {
      const errorMessage =
        (err as { response?: { data?: { message?: string } } })?.response?.data
          ?.message || "Failed to add comment";
      showError(errorMessage);
      throw err;
    }
  };

  const handleReply = async (parentId: string, content: string) => {
    try {
      const response = await commentService.addComment(postId, {
        content,
        parentCommentId: parentId,
      });
      if (response.success) {
        setComments((prev) =>
          updateCommentReplies(prev, parentId, response.data.comment)
        );
        showSuccess("Reply added successfully!");
      }
    } catch (err) {
      const errorMessage =
        (err as { response?: { data?: { message?: string } } })?.response?.data
          ?.message || "Failed to add reply";
      showError(errorMessage);
      throw err;
    }
  };

  const handleUpdate = async (id: string, content: string) => {
    try {
      const response = await commentService.updateComment(id, { content });
      if (response.success) {
        setComments((prev) =>
          updateCommentInTree(prev, id, response.data.comment)
        );
        showSuccess("Comment updated successfully!");
      }
    } catch (err) {
      const errorMessage =
        (err as { response?: { data?: { message?: string } } })?.response?.data
          ?.message || "Failed to update comment";
      showError(errorMessage);
      throw err;
    }
  };

  const handleDelete = async (id: string) => {
    try {
      await commentService.deleteComment(id);
      setComments((prev) => markCommentAsDeleted(prev, id));
      showSuccess("Comment deleted successfully!");
    } catch (err) {
      const errorMessage =
        (err as { response?: { data?: { message?: string } } })?.response?.data
          ?.message || "Failed to delete comment";
      showError(errorMessage);
      throw err;
    }
  };

  const updateCommentReplies = (
    comments: Comment[],
    parentId: string,
    newReply: Comment
  ): Comment[] =>
    comments.map((comment) => {
      if (comment._id === parentId) {
        return {
          ...comment,
          replies: comment.replies
            ? [newReply, ...comment.replies]
            : [newReply],
          replyCount: comment.replyCount + 1,
        };
      } else if (comment.replies?.length) {
        return {
          ...comment,
          replies: updateCommentReplies(comment.replies, parentId, newReply),
        };
      }
      return comment;
    });

  const updateCommentInTree = (
    comments: Comment[],
    id: string,
    updated: Comment
  ): Comment[] =>
    comments.map((comment) => {
      if (comment._id === id) return updated;
      if (comment.replies?.length)
        return {
          ...comment,
          replies: updateCommentInTree(comment.replies, id, updated),
        };
      return comment;
    });

  const markCommentAsDeleted = (comments: Comment[], id: string): Comment[] =>
    comments.map((comment) => {
      if (comment._id === id)
        return { ...comment, isDeleted: true, content: "[Comment deleted]" };
      if (comment.replies?.length)
        return {
          ...comment,
          replies: markCommentAsDeleted(comment.replies, id),
        };
      return comment;
    });

  const totalComments = pagination?.totalComments || comments.length;

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200">
      {/* Header */}
      <div className="p-4 sm:p-6 border-b border-gray-200 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-2">
          <ChatBubbleLeftIcon className="h-5 w-5 text-gray-600" />
          <h3 className="text-lg font-semibold text-gray-900">
            Comments ({totalComments})
          </h3>
        </div>
        <div className="flex items-center gap-2">
          <label htmlFor="sort-comments" className="text-sm text-gray-600">
            Sort by:
          </label>
          <select
            id="sort-comments"
            value={sortBy}
            onChange={(e) =>
              setSortBy(e.target.value as "newest" | "oldest" | "popular")
            }
            className="text-sm border border-gray-300 rounded px-2 py-1 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="newest">Newest</option>
            <option value="popular">Popular</option>
            <option value="oldest">Oldest</option>
          </select>
        </div>
      </div>

      {/* Add Comment */}
      <div className="p-4 sm:p-6 border-b border-gray-200">
        <CommentForm
          onSubmit={handleAddComment}
          placeholder="What are your thoughts on this post?"
        />
      </div>

      {/* Comments List */}
      <div className="p-4 sm:p-6">
        {loading ? (
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
            <p className="mt-2 text-gray-600">Loading comments...</p>
          </div>
        ) : error ? (
          <div className="text-center py-12">
            <p className="text-red-600 mb-4">{error}</p>
            <button
              onClick={fetchComments}
              className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
            >
              Try Again
            </button>
          </div>
        ) : comments.length === 0 ? (
          <div className="text-center py-12">
            <ChatBubbleLeftIcon className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-600 text-lg">No comments yet</p>
            <p className="text-gray-500">
              Be the first to start the discussion!
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {comments.map((comment) => (
              <CommentCard
                key={comment._id}
                comment={comment}
                onReply={handleReply}
                onUpdate={handleUpdate}
                onDelete={handleDelete}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default CommentSection;
