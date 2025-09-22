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
// import ReactMarkdown from "react-markdown";

interface CommentCardProps {
  comment: Comment;
  onReply: (id: string, content: string) => Promise<void>;
  onUpdate: (id: string, content: string) => Promise<void>;
  onDelete: (id: string) => Promise<void>;
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

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    const seconds = (Date.now() - date.getTime()) / 1000;
    if (seconds < 60) return `${Math.floor(seconds)}s ago`;
    if (seconds < 3600) return `${Math.floor(seconds / 60)}m ago`;
    if (seconds < 86400) return `${Math.floor(seconds / 3600)}h ago`;
    if (seconds < 604800) return `${Math.floor(seconds / 86400)}d ago`;
    return date.toLocaleDateString();
  };

  const handleVote = async (type: "upvote" | "downvote") => {
    if (!isAuthenticated) {
      showError("Please login to vote");
      return;
    }
    if (isVoting) return;
    setIsVoting(true);
    try {
      const res = await commentService.voteComment(comment._id, type);
      if (res.success) {
        setComment((prev) => ({
          ...prev,
          votes: res.data.votes as {
            upvotes: number;
            downvotes: number;
            score: number;
          },
        }));
        setUserVote(
          res.data.userVote === "upvote" || res.data.userVote === "downvote"
            ? (res.data.userVote as "upvote" | "downvote")
            : null
        );
      }
    } catch {
      showError("Vote failed");
    } finally {
      setIsVoting(false);
    }
  };

  const handleReply = async (content: string) => {
    await onReply(comment._id, content);
    setShowReplyForm(false);
  };

  // Optional: Implement editing like below if needed
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
      showSuccess("Comment deleted");
    } catch {
      // ignore errors for now
    } finally {
      setIsDeleting(false);
    }
  };

  const toggleReplies = () => setShowReplies((v) => !v);

  // Dynamic indentation via inline style
  const indentPx = Math.min(depth * 16, 64);

  if (comment.isDeleted) {
    return (
      <div
        style={{ marginLeft: indentPx }}
        className="border-l border-gray-200 pl-4 py-2"
      >
        <div className="bg-gray-50 border border-gray-200 rounded p-3">
          <em className="text-gray-500">[comment deleted]</em>
        </div>
      </div>
    );
  }

  return (
    <div
      style={{ marginLeft: indentPx }}
      className="border-l border-gray-200 pl-4 mb-3"
    >
      <div className="bg-white border border-gray-200 rounded-lg p-4 shadow-sm hover:shadow-md transition-shadow">
        <div className="flex flex-col sm:flex-row sm:justify-between gap-4">
          {/* Left: Avatar & author */}
          <div className="flex gap-3">
            <div className="flex-shrink-0 w-8 h-8 rounded-full bg-gradient-to-r from-blue-500 to-purple-600 flex items-center justify-center text-white font-semibold select-none">
              {comment.authorDetails.firstName[0]}
              {comment.authorDetails.lastName[0]}
            </div>
            <div className="min-w-0">
              <p className="font-medium text-gray-900 truncate">
                {comment.authorDetails.firstName}{" "}
                {comment.authorDetails.lastName}
              </p>
              <p className="text-xs text-gray-500 flex items-center gap-1 select-none">
                <CalendarIcon className="w-3 h-3" />{" "}
                {formatDate(comment.createdAt)}{" "}
                {comment.isEdited && <em>· edited</em>}
              </p>
            </div>
            <div className="mt-2 text-gray-800 whitespace-pre-wrap leading-relaxed break-words max-w-full">
              {comment.content}
            </div>
          </div>

          {/* Right: Actions */}
          <div className="flex flex-wrap items-center gap-2">
            {/* Votes */}
            <button
              onClick={() => handleVote("upvote")}
              disabled={!isAuthenticated || isVoting}
              className={`flex items-center gap-1 rounded px-2 py-1 text-sm transition ${
                userVote === "upvote"
                  ? "bg-green-100 text-green-700"
                  : "text-gray-600 hover:bg-green-50"
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
              className={`flex items-center gap-1 rounded px-2 py-1 text-sm transition ${
                userVote === "downvote"
                  ? "bg-red-100 text-red-700"
                  : "text-gray-600 hover:bg-red-50"
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
                onClick={() => setShowReplyForm((v) => !v)}
                className="flex items-center gap-1 rounded px-2 py-1 text-sm text-blue-600 hover:text-blue-800 transition whitespace-nowrap"
              >
                <ChatBubbleLeftIcon className="w-4 h-4" /> <span>Reply</span>
              </button>
            )}

            {/* Toggle Replies */}
            {comment.replyCount > 0 && (
              <button
                onClick={toggleReplies}
                className="flex items-center gap-1 rounded px-2 py-1 text-sm text-gray-600 hover:text-gray-800 transition whitespace-nowrap"
                aria-expanded={showReplies}
              >
                {showReplies ? (
                  <>
                    <ChevronUpIcon className="w-4 h-4" />{" "}
                    <span>Hide Replies ({comment.replyCount})</span>
                  </>
                ) : (
                  <>
                    <ChevronDownIcon className="w-4 h-4" />{" "}
                    <span>Show Replies ({comment.replyCount})</span>
                  </>
                )}
              </button>
            )}

            {/* Author controls */}
            {isAuthor && !showEditForm && (
              <>
                <button
                  onClick={() => setShowEditForm(true)}
                  className="p-1 rounded text-gray-500 hover:text-blue-600"
                  aria-label="Edit comment"
                >
                  <PencilIcon className="w-4 h-4" />
                </button>
                <button
                  onClick={handleDelete}
                  disabled={isDeleting}
                  className="p-1 rounded text-gray-500 hover:text-red-600 disabled:opacity-50 disabled:pointer-events-none"
                  aria-label="Delete comment"
                >
                  <TrashIcon className="w-4 h-4" />
                </button>
              </>
            )}
          </div>
        </div>

        {/* Reply Form */}
        {showReplyForm && (
          <div className="ml-10 mt-3 sm:ml-16">
            <CommentForm
              onSubmit={handleReply}
              placeholder="Write a reply"
              autoFocus
              onCancel={() => setShowReplyForm(false)}
              isReply
            />
          </div>
        )}

        {/* Nested replies */}
        {showReplies &&
          Array.isArray(comment.replies) &&
          comment.replies.length > 0 && (
            <div className="border-l border-gray-200 pl-10 mt-3 sm:pl-16">
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
                <button className="ml-4 mt-2 text-sm text-blue-600 hover:text-blue-800">
                  Load more replies...
                </button>
              )}
            </div>
          )}
      </div>
    </div>
  );
};

export default CommentCard;
