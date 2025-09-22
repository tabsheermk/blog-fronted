import React, { useState } from "react";
import { Link } from "react-router-dom";
import {
  HandThumbUpIcon,
  HandThumbDownIcon,
  ChatBubbleLeftIcon,
  EyeIcon,
  ClockIcon,
  CalendarIcon,
} from "@heroicons/react/24/outline";
import {
  HandThumbUpIcon as HandThumbUpSolidIcon,
  HandThumbDownIcon as HandThumbDownSolidIcon,
} from "@heroicons/react/24/solid";
import type { Post } from "../../types";
import { postService } from "../../services/postsService";
import { useAuth } from "../../contexts/AuthContext";
import { showError } from "../../utils/toast";

interface PostCardProps {
  post: Post;
}

const PostCard: React.FC<PostCardProps> = ({ post: initialPost }) => {
  const { isAuthenticated } = useAuth();
  const [post, setPost] = useState(initialPost);
  const [userVote, setUserVote] = useState<"upvote" | "downvote" | null>(null);
  const [isVoting, setIsVoting] = useState(false);

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  };

  const truncateContent = (content: string, maxLength: number = 150) => {
    if (content.length <= maxLength) return content;
    return content.substr(0, maxLength) + "...";
  };

  const handleVote = async (voteType: "upvote" | "downvote") => {
    if (!isAuthenticated) {
      showError("Please login to vote on posts");
      return;
    }

    if (isVoting) return;

    setIsVoting(true);
    try {
      const response = await postService.votePost(post._id, voteType);
      if (response.success) {
        setPost((prev) => ({
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
    } catch (error) {
      const err = error as { response?: { data?: { message?: string } } };
      const errorMessage = err.response?.data?.message || "Failed to vote";
      showError(errorMessage);
    } finally {
      setIsVoting(false);
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-md border border-gray-200 hover:shadow-lg transition-shadow duration-200 max-w-full sm:max-w-md mx-auto">
      <div className="p-6 flex flex-col">
        {/* Header */}
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-full bg-gradient-to-r from-blue-500 to-purple-600 flex items-center justify-center text-white font-semibold select-none">
              {post.authorDetails.firstName[0]}
              {post.authorDetails.lastName[0]}
            </div>
            <div>
              <p className="text-sm font-medium text-gray-900">
                {post.authorDetails.firstName} {post.authorDetails.lastName}
              </p>
              <div className="flex flex-wrap items-center gap-1 text-xs text-gray-500">
                <CalendarIcon className="w-3 h-3" />
                <span>{formatDate(post.createdAt)}</span>
                <span>•</span>
                <ClockIcon className="w-3 h-3" />
                <span>{post.readTime} min</span>
              </div>
            </div>
          </div>
        </div>

        {/* Title */}
        <Link
          to={`/posts/${post.slug}`}
          className="block mb-3"
          title={post.title}
        >
          <h3 className="text-xl font-semibold text-gray-900 hover:text-blue-600 transition-colors line-clamp-2">
            {post.title}
          </h3>
        </Link>

        {/* Content Preview */}
        <p className="text-gray-600 text-sm mb-4 line-clamp-3">
          {truncateContent(post.content)}
        </p>

        {/* Tags */}
        <div className="flex flex-wrap gap-2 mb-4">
          {post.tags.slice(0, 3).map((tag) => (
            <span
              key={tag}
              className="px-2 py-1 bg-blue-100 text-blue-700 text-xs font-medium rounded-full"
            >
              #{tag}
            </span>
          ))}
          {post.tags.length > 3 && (
            <span className="px-2 py-1 bg-gray-100 text-gray-600 text-xs font-medium rounded-full">
              +{post.tags.length - 3} more
            </span>
          )}
        </div>

        {/* Footer */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3 border-t border-gray-100 pt-4">
          <div className="flex flex-wrap items-center gap-3">
            {/* Votes */}
            <button
              onClick={() => handleVote("upvote")}
              disabled={isVoting || !isAuthenticated}
              className={`flex items-center gap-1 px-2 py-1 rounded text-sm transition-colors ${
                userVote === "upvote"
                  ? "bg-green-100 text-green-700"
                  : "hover:bg-green-50 text-gray-600"
              } disabled:opacity-50 disabled:pointer-events-none`}
            >
              {userVote === "upvote" ? (
                <HandThumbUpSolidIcon className="w-4 h-4" />
              ) : (
                <HandThumbUpIcon className="w-4 h-4" />
              )}
              <span>{post.votes.upvotes}</span>
            </button>

            <button
              onClick={() => handleVote("downvote")}
              disabled={isVoting || !isAuthenticated}
              className={`flex items-center gap-1 px-2 py-1 rounded text-sm transition-colors ${
                userVote === "downvote"
                  ? "bg-red-100 text-red-700"
                  : "hover:bg-green-50 text-gray-600"
              } disabled:opacity-50 disabled:pointer-events-none`}
            >
              {userVote === "downvote" ? (
                <HandThumbDownSolidIcon className="w-4 h-4" />
              ) : (
                <HandThumbDownIcon className="w-4 h-4" />
              )}
              <span>{post.votes.downvotes}</span>
            </button>

            {/* Comments */}
            <div className="flex items-center gap-1 text-gray-500 text-sm select-none">
              <ChatBubbleLeftIcon className="w-4 h-4" />
              <span>{post.commentCount}</span>
            </div>

            {/* Views */}
            <div className="flex items-center gap-1 text-gray-500 text-sm select-none">
              <EyeIcon className="w-4 h-4" />
              <span>{post.views}</span>
            </div>
          </div>

          {/* Read More */}
          <Link
            to={`/posts/${post.slug}`}
            className="text-blue-600 hover:text-blue-700 transition-colors text-sm font-medium whitespace-nowrap"
          >
            Read more →
          </Link>
        </div>
      </div>
    </div>
  );
};

export default PostCard;
