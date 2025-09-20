import React, { useState } from "react";
import type { Comment } from "../../types";
import { useAuth } from "../../contexts/AuthContext";
import { commentService } from "../../services/commentService";
import CommentForm from "./CommentForm";
import { showError, showSuccess } from "../../utils/toast";
import {
  HandThumbUpIcon,
  HandThumbDownIcon,
  ChatBubbleLeftIcon,
  PencilIcon,
  TrashIcon,
  CalendarIcon,
  ChevronDownIcon,
  ChevronUpIcon,
} from "@heroicons/react/24/outline";
import {
  HandThumbUpIcon as HandThumbUpSolidIcon,
  HandThumbDownIcon as HandThumbDownSolidIcon,
} from "@heroicons/react/24/solid";

interface CommentCardProps {
  comment: Comment;
  onReply: (commentId: string, content: string) => Promise<void>;
  onUpdate: (commentId: string, content: string) => Promise<void>;
  onDelete: (commentId: string) => Promise<void>;
  depth?: number;
  maxDepth?: number;
}

const CommentCard: React.FC<CommentCardProps> = ({
  comment: initialComment,
  onReply,
  onUpdate,
  onDelete,
  depth = 0,
  maxDepth = 3,
}) => {
  const { user, isAuthenticated } = useAuth();
  const [comment, setComment] = useState(initialComment);
  const [showReplyForm, setShowReplyForm] = useState(false);
  const [showEditForm, setShowEditForm] = useState(false);
  const [showReplies, setShowReplies] = useState(true);
  const [userVote, setUserVote] = useState<"upvote" | "downvote" | null>(null);
  const [isVoting, setIsVoting] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  const isAuthor = user && comment.author === user.id;
  const canReply = isAuthenticated && depth < maxDepth;

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / (1000 * 60));
    const diffHours = Math.floor(diffMins / 60);
    const diffDays = Math.floor(diffHours / 24);

    if (diffMins < 60) {
      return `${diffMins}m ago`;
    } else if (diffHours < 24) {
      return `${diffHours}h ago`;
    } else if (diffDays < 7) {
      return `${diffDays}d ago`;
    } else {
      return date.toLocaleDateString();
    }
  };

  const handleVote = async (voteType: "upvote" | "downvote") => {
    if (!isAuthenticated) {
      showError("Please login to vote on comments");
      return;
    }

    if (isVoting) return;

    setIsVoting(true);
    try {
      const response = await commentService.voteComment(comment._id, voteType);

      if (response.success) {
        setComment((prev) => ({
          ...prev,
          votes: response.data.votes as typeof prev.votes,
        }));
        setUserVote(
          response.data.userVote === "upvote" ||
            response.data.userVote === "downvote"
            ? response.data.userVote
            : null
        );
      }
    } catch (error: unknown) {
      const err = error as { response?: { data?: { message?: string } } };
      const errorMessage = err.response?.data?.message || "Failed to vote";
      showError(errorMessage);
    } finally {
      setIsVoting(false);
    }
  };

  const handleReply = async (content: string) => {
    await onReply(comment._id, content);
    setShowReplyForm(false);
  };

  const handleEdit = async (content: string) => {
    await onUpdate(comment._id, content);
    setShowEditForm(false);
  };

  const handleDelete = async () => {
    if (!window.confirm("Are you sure you want to delete this comment?")) {
      return;
    }

    setIsDeleting(true);
    try {
      await onDelete(comment._id);
      showSuccess("Comment deleted successfully");
    } catch (error) {
      console.error("Delete comment error:", error);
    } finally {
      setIsDeleting(false);
    }
  };

  const toggleReplies = () => {
    setShowReplies(!showReplies);
  };

  // Indentation style based on depth
  const indentClass = depth > 0 ? `ml-${Math.min(depth * 4, 16)}` : "";
  const borderClass = depth > 0 ? "border-l-2 border-gray-200 pl-4" : "";

  if (comment.isDeleted) {
    return (
      <div className={`${indentClass} ${borderClass} py-2`}>
        <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
          <p className="text-gray-500 italic">[Comment deleted]</p>
        </div>
      </div>
    );
  }

  return (
    <div className={`${indentClass} ${borderClass}`}>
      <div className="bg-white border border-gray-200 rounded-lg p-4 mb-3">
        {/* Comment Header */}
        <div className="flex items-start justify-between mb-3">
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white font-semibold text-sm">
              {comment.authorDetails.firstName[0]}
              {comment.authorDetails.lastName[0]}
            </div>
            <div>
              <p className="font-medium text-gray-900 text-sm">
                {comment.authorDetails.firstName}{" "}
                {comment.authorDetails.lastName}
              </p>
              <div className="flex items-center space-x-2 text-xs text-gray-500">
                <CalendarIcon className="h-3 w-3" />
                <span>{formatDate(comment.createdAt)}</span>
                {comment.isEdited && <span>• edited</span>}
              </div>
            </div>
          </div>
        </div>

        {/* Comment Content */}
        {showEditForm ? (
          <div className="mb-4">
            <CommentForm
              onSubmit={handleEdit}
              placeholder="Edit your comment..."
              buttonText="Save"
              autoFocus
              onCancel={() => setShowEditForm(false)}
              isReply
            />
          </div>
        ) : (
          <div className="mb-4">
            <p className="text-gray-800 whitespace-pre-wrap leading-relaxed">
              {comment.content}
            </p>
          </div>
        )}

        {/* Comment Actions */}
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            {/* Voting */}
            <div className="flex items-center space-x-2">
              <button
                onClick={() => handleVote("upvote")}
                disabled={isVoting || !isAuthenticated}
                className={`flex items-center space-x-1 px-2 py-1 rounded transition-colors text-sm ${
                  userVote === "upvote"
                    ? "bg-green-100 text-green-700"
                    : "hover:bg-green-50 text-gray-600"
                } disabled:opacity-50 disabled:cursor-not-allowed`}
              >
                {userVote === "upvote" ? (
                  <HandThumbUpSolidIcon className="h-3 w-3" />
                ) : (
                  <HandThumbUpIcon className="h-3 w-3" />
                )}
                <span>{comment.votes.upvotes}</span>
              </button>

              <button
                onClick={() => handleVote("downvote")}
                disabled={isVoting || !isAuthenticated}
                className={`flex items-center space-x-1 px-2 py-1 rounded transition-colors text-sm ${
                  userVote === "downvote"
                    ? "bg-red-100 text-red-700"
                    : "hover:bg-red-50 text-gray-600"
                } disabled:opacity-50 disabled:cursor-not-allowed`}
              >
                {userVote === "downvote" ? (
                  <HandThumbDownSolidIcon className="h-3 w-3" />
                ) : (
                  <HandThumbDownIcon className="h-3 w-3" />
                )}
                <span>{comment.votes.downvotes}</span>
              </button>
            </div>

            {/* Reply Button */}
            {canReply && (
              <button
                onClick={() => setShowReplyForm(!showReplyForm)}
                className="flex items-center space-x-1 text-gray-600 hover:text-blue-600 text-sm transition-colors"
              >
                <ChatBubbleLeftIcon className="h-3 w-3" />
                <span>Reply</span>
              </button>
            )}

            {/* Show/Hide Replies */}
            {comment.replyCount > 0 && (
              <button
                onClick={toggleReplies}
                className="flex items-center space-x-1 text-gray-600 hover:text-blue-600 text-sm transition-colors"
              >
                {showReplies ? (
                  <ChevronUpIcon className="h-3 w-3" />
                ) : (
                  <ChevronDownIcon className="h-3 w-3" />
                )}
                <span>
                  {comment.replyCount}{" "}
                  {comment.replyCount === 1 ? "reply" : "replies"}
                </span>
              </button>
            )}
          </div>

          {/* Author Actions */}
          {isAuthor && !showEditForm && (
            <div className="flex items-center space-x-2">
              <button
                onClick={() => setShowEditForm(true)}
                className="text-gray-500 hover:text-blue-600 transition-colors"
              >
                <PencilIcon className="h-4 w-4" />
              </button>
              <button
                onClick={handleDelete}
                disabled={isDeleting}
                className="text-gray-500 hover:text-red-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                <TrashIcon className="h-4 w-4" />
              </button>
            </div>
          )}
        </div>

        {/* Reply Form */}
        {showReplyForm && (
          <div className="mt-4">
            <CommentForm
              onSubmit={handleReply}
              placeholder="Write a reply..."
              buttonText="Reply"
              autoFocus
              onCancel={() => setShowReplyForm(false)}
              isReply
            />
          </div>
        )}
      </div>

      {/* Nested Replies */}
      {showReplies && comment.replies && comment.replies.length > 0 && (
        <div className="space-y-2">
          {comment.replies.map((reply) => (
            <CommentCard
              key={reply._id}
              comment={reply}
              onReply={onReply}
              onUpdate={onUpdate}
              onDelete={onDelete}
              depth={depth + 1}
              maxDepth={maxDepth}
            />
          ))}
        </div>
      )}

      {/* Load More Replies */}
      {comment.hasMoreReplies && (
        <div className="ml-8 mt-2">
          <button className="text-blue-600 hover:text-blue-800 text-sm font-medium transition-colors">
            Load more replies...
          </button>
        </div>
      )}
    </div>
  );
};

export default CommentCard;
