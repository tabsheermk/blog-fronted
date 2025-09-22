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
  HandThumbUpIcon as HandThumbUpSolid,
  HandThumbDownIcon as HandThumbDownSolid,
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

    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    if (diffDays < 7) return `${diffDays}d ago`;
    return date.toLocaleDateString();
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
        const validVote = ["upvote", "downvote"].includes(
          response.data.userVote as string
        )
          ? response.data.userVote
          : null;
        setUserVote(validVote as "upvote" | "downvote" | null);
      }
    } catch {
      showError("Failed to vote");
    } finally {
      setIsVoting(false);
    }
  };

  const handleReply = async (content: string) => {
    await onReply(comment._id, content);
    setShowReplyForm(false);
  };

  // const handleEdit = async (content: string) => {
  //   await onUpdate(comment._id, content);
  //   setShowEditForm(false);
  // };

  const handleDelete = async () => {
    if (!window.confirm("Are you sure you want to delete this comment?"))
      return;

    setIsDeleting(true);
    try {
      await onDelete(comment._id);
      showSuccess("Comment deleted successfully");
    } catch {
      // ignore error
    } finally {
      setIsDeleting(false);
    }
  };

  const toggleReplies = () => setShowReplies(!showReplies);

  // Responsive indentation with Tailwind spacing scale (4 = 1rem)
  const indentClass = depth > 0 ? `ml-[${Math.min(depth * 16, 64)}px]` : "";
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
      <div className="bg-white border border-gray-200 rounded-lg p-4 mb-3 shadow-sm hover:shadow-md transition-shadow">
        <div className="flex flex-col sm:flex-row sm:justify-between">
          {/* Left section */}
          <div className="flex items-start space-x-3">
            <div className="flex-shrink-0 w-8 h-8 rounded-full bg-gradient-to-r from-blue-500 to-purple-600 flex items-center justify-center text-white font-semibold text-sm select-none">
              {comment.authorDetails.firstName[0]}
              {comment.authorDetails.lastName[0]}
            </div>
            <div className="min-w-0">
              <p className="font-medium text-gray-900 text-sm truncate">
                {comment.authorDetails.firstName}{" "}
                {comment.authorDetails.lastName}
              </p>
              <div className="flex items-center space-x-1 text-xs text-gray-500">
                <CalendarIcon className="w-3 h-3" />
                <span>{formatDate(comment.createdAt)}</span>
                {comment.isEdited && <span>· edited</span>}
              </div>
            </div>
          </div>

          {/* Right section */}
          <div className="mt-3 sm:mt-0 flex flex-wrap items-center space-x-2">
            {/* Voting */}
            <button
              onClick={() => handleVote("upvote")}
              disabled={!isAuthenticated || isVoting}
              className={`flex items-center space-x-1 px-2 py-1 rounded text-sm transition-colors ${
                userVote === "upvote"
                  ? "bg-green-100 text-green-700"
                  : "hover:bg-green-50 text-gray-600"
              } disabled:opacity-50 disabled:pointer-events-none`}
            >
              {userVote === "upvote" ? (
                <HandThumbUpSolid className="w-4 h-4" />
              ) : (
                <HandThumbUpIcon className="w-4 h-4" />
              )}
              <span>{comment.votes.upvotes}</span>
            </button>
            <button
              onClick={() => handleVote("downvote")}
              disabled={!isAuthenticated || isVoting}
              className={`flex items-center space-x-1 px-2 py-1 rounded text-sm transition-colors ${
                userVote === "downvote"
                  ? "bg-red-100 text-red-700"
                  : "hover:bg-green-50 text-gray-600"
              } disabled:opacity-50 disabled:pointer-events-none`}
            >
              {userVote === "downvote" ? (
                <HandThumbDownSolid className="w-4 h-4" />
              ) : (
                <HandThumbDownIcon className="w-4 h-4" />
              )}
              <span>{comment.votes.downvotes}</span>
            </button>

            {/* Reply */}
            {canReply && (
              <button
                onClick={() => setShowReplyForm(!showReplyForm)}
                className="flex items-center space-x-1 text-blue-600 hover:text-blue-800 transition-colors text-sm whitespace-nowrap px-2 py-1 rounded"
              >
                <ChatBubbleLeftIcon className="w-4 h-4" />
                <span>Reply</span>
              </button>
            )}

            {/* Toggle replies */}
            {comment.replyCount > 0 && (
              <button
                onClick={toggleReplies}
                className="flex items-center space-x-1 text-gray-600 hover:text-gray-800 transition-colors text-sm whitespace-nowrap px-2 py-1 rounded"
                aria-expanded={showReplies}
              >
                {showReplies ? (
                  <>
                    <ChevronUpIcon className="w-4 h-4" />
                    <span>Hide Replies ({comment.replyCount})</span>
                  </>
                ) : (
                  <>
                    <ChevronDownIcon className="w-4 h-4" />
                    <span>Show Replies ({comment.replyCount})</span>
                  </>
                )}
              </button>
            )}

            {/* Edit/Delete */}
            {isAuthor && !showEditForm && (
              <>
                <button
                  onClick={() => setShowEditForm(true)}
                  className="text-gray-500 hover:text-blue-600 p-1 rounded"
                  aria-label="Edit comment"
                >
                  <PencilIcon className="w-4 h-4" />
                </button>
                <button
                  onClick={handleDelete}
                  disabled={isDeleting}
                  className="text-gray-500 hover:text-red-600 p-1 rounded disabled:opacity-50 disabled:pointer-events-none"
                  aria-label="Delete comment"
                >
                  <TrashIcon className="w-4 h-4" />
                </button>
              </>
            )}
          </div>
        </div>

        {/* Reply form */}
        {showReplyForm && (
          <div className="mt-3 ml-10 sm:ml-16">
            <CommentForm
              onSubmit={handleReply}
              placeholder="Write a reply"
              buttonText="Reply"
              autoFocus
              onCancel={() => setShowReplyForm(false)}
              isReply
            />
          </div>
        )}
      </div>

      {/* Replies */}
      {showReplies &&
        Array.isArray(comment?.replies) &&
        comment.replies.length > 0 && (
          <div className="pl-10 sm:pl-16 border-l border-gray-200">
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
            {comment.hasMoreReplies && (
              <button className="text-blue-600 hover:text-blue-800 mt-2 ml-10 sm:ml-16 text-sm">
                Load more replies...
              </button>
            )}
          </div>
        )}
    </div>
  );
};

export default CommentCard;
