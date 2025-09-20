import React, { useState, useEffect } from "react";
import type { Comment } from "../../types";
import { commentService } from "../../services/commentService";
import CommentForm from "./CommentForm";
import CommentCard from "./CommentCard";
import { showError, showSuccess } from "../../utils/toast";
import {
  ChatBubbleLeftIcon,
  //   FireIcon,
  //   ClockIcon,
} from "@heroicons/react/24/outline";

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
    } catch (err: unknown) {
      const errorMessage =
        (err as { response?: { data?: { message?: string } } }).response?.data
          ?.message || "Failed to load comments";
      setError(errorMessage);
      console.error("Fetch comments error:", err);
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
    } catch (error: unknown) {
      const err = error as { response?: { data?: { message?: string } } };
      const errorMessage =
        err.response?.data?.message || "Failed to add comment";
      showError(errorMessage);
      throw error;
    }
  };

  const handleReply = async (parentCommentId: string, content: string) => {
    try {
      const response = await commentService.addComment(postId, {
        content,
        parentCommentId,
      });

      if (response.success) {
        // Update the parent comment's reply count and add the reply
        setComments((prev) =>
          updateCommentReplies(prev, parentCommentId, response.data.comment)
        );
        showSuccess("Reply added successfully!");
      }
    } catch (error: unknown) {
      const err = error as { response?: { data?: { message?: string } } };
      const errorMessage = err.response?.data?.message || "Failed to add reply";
      showError(errorMessage);
      throw error;
    }
  };

  const handleUpdateComment = async (commentId: string, content: string) => {
    try {
      const response = await commentService.updateComment(commentId, {
        content,
      });

      if (response.success) {
        setComments((prev) =>
          updateCommentInTree(prev, commentId, response.data.comment)
        );
        showSuccess("Comment updated successfully!");
      }
    } catch (error: unknown) {
      const err = error as { response?: { data?: { message?: string } } };
      const errorMessage =
        err.response?.data?.message || "Failed to update comment";
      showError(errorMessage);
      throw error;
    }
  };

  const handleDeleteComment = async (commentId: string) => {
    try {
      await commentService.deleteComment(commentId);
      setComments((prev) => markCommentAsDeleted(prev, commentId));
      showSuccess("Comment deleted successfully!");
    } catch (error: unknown) {
      const err = error as { response?: { data?: { message?: string } } };
      const errorMessage =
        err.response?.data?.message || "Failed to delete comment";
      showError(errorMessage);
      throw error;
    }
  };

  // Helper function to update comment replies in nested structure
  const updateCommentReplies = (
    comments: Comment[],
    parentId: string,
    newReply: Comment
  ): Comment[] => {
    return comments.map((comment) => {
      if (comment._id === parentId) {
        return {
          ...comment,
          replies: comment.replies
            ? [newReply, ...comment.replies]
            : [newReply],
          replyCount: comment.replyCount + 1,
        };
      } else if (comment.replies && comment.replies.length > 0) {
        return {
          ...comment,
          replies: updateCommentReplies(comment.replies, parentId, newReply),
        };
      }
      return comment;
    });
  };

  // Helper function to update a comment in nested structure
  const updateCommentInTree = (
    comments: Comment[],
    commentId: string,
    updatedComment: Comment
  ): Comment[] => {
    return comments.map((comment) => {
      if (comment._id === commentId) {
        return updatedComment;
      } else if (comment.replies && comment.replies.length > 0) {
        return {
          ...comment,
          replies: updateCommentInTree(
            comment.replies,
            commentId,
            updatedComment
          ),
        };
      }
      return comment;
    });
  };

  // Helper function to mark comment as deleted
  const markCommentAsDeleted = (
    comments: Comment[],
    commentId: string
  ): Comment[] => {
    return comments.map((comment) => {
      if (comment._id === commentId) {
        return {
          ...comment,
          isDeleted: true,
          content: "[Comment deleted]",
        };
      } else if (comment.replies && comment.replies.length > 0) {
        return {
          ...comment,
          replies: markCommentAsDeleted(comment.replies, commentId),
        };
      }
      return comment;
    });
  };

  const totalComments = pagination?.totalComments || comments.length;

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200">
      {/* Header */}
      <div className="p-6 border-b border-gray-200">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center space-x-2">
            <ChatBubbleLeftIcon className="h-5 w-5 text-gray-600" />
            <h3 className="text-lg font-semibold text-gray-900">
              Comments ({totalComments})
            </h3>
          </div>

          {/* Sort Options */}
          <div className="flex items-center space-x-2">
            <span className="text-sm text-gray-600">Sort by:</span>
            <select
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

        {/* Add Comment Form */}
        <CommentForm
          onSubmit={handleAddComment}
          placeholder="What are your thoughts on this post?"
        />
      </div>

      {/* Comments List */}
      <div className="p-6">
        {loading ? (
          <div className="text-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
            <p className="mt-2 text-gray-600">Loading comments...</p>
          </div>
        ) : error ? (
          <div className="text-center py-8">
            <p className="text-red-600 mb-4">{error}</p>
            <button
              onClick={fetchComments}
              className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
            >
              Try Again
            </button>
          </div>
        ) : comments.length === 0 ? (
          <div className="text-center py-8">
            <ChatBubbleLeftIcon className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-600 text-lg mb-2">No comments yet</p>
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
                onUpdate={handleUpdateComment}
                onDelete={handleDeleteComment}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default CommentSection;
