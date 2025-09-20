import React from "react";
import { Link } from "react-router-dom";
import {
  HandThumbUpIcon,
  HandThumbDownIcon,
  ChatBubbleLeftIcon,
  EyeIcon,
  ClockIcon,
  CalendarIcon,
} from "@heroicons/react/24/outline";
import type { Post } from "../../types/index.ts";

interface PostCardProps {
  post: Post;
}

const PostCard: React.FC<PostCardProps> = ({ post }) => {
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

  return (
    <div className="bg-white rounded-lg shadow-md hover:shadow-lg transition-shadow duration-200 border border-gray-200">
      <div className="p-6">
        {/* Header */}
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white font-semibold">
              {post.authorDetails.firstName[0]}
              {post.authorDetails.lastName[0]}
            </div>
            <div>
              <p className="text-sm font-medium text-gray-900">
                {post.authorDetails.firstName} {post.authorDetails.lastName}
              </p>
              <div className="flex items-center space-x-2 text-xs text-gray-500">
                <CalendarIcon className="h-3 w-3" />
                <span>{formatDate(post.createdAt)}</span>
                <span>•</span>
                <ClockIcon className="h-3 w-3" />
                <span>{post.readTime} min read</span>
              </div>
            </div>
          </div>
        </div>

        {/* Title */}
        <Link to={`/posts/${post.slug}`} className="block mb-3">
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
        <div className="flex items-center justify-between pt-4 border-t border-gray-100">
          <div className="flex items-center space-x-6">
            {/* Votes */}
            <div className="flex items-center space-x-1">
              <HandThumbUpIcon className="h-4 w-4 text-green-600" />
              <span className="text-sm font-medium text-gray-600">
                {post.votes.upvotes}
              </span>
              <HandThumbDownIcon className="h-4 w-4 text-red-500 ml-1" />
              <span className="text-sm font-medium text-gray-600">
                {post.votes.downvotes}
              </span>
            </div>

            {/* Comments */}
            <div className="flex items-center space-x-1">
              <ChatBubbleLeftIcon className="h-4 w-4 text-gray-500" />
              <span className="text-sm text-gray-600">{post.commentCount}</span>
            </div>

            {/* Views */}
            <div className="flex items-center space-x-1">
              <EyeIcon className="h-4 w-4 text-gray-500" />
              <span className="text-sm text-gray-600">{post.views}</span>
            </div>
          </div>

          {/* Read More */}
          <Link
            to={`/posts/${post.slug}`}
            className="text-blue-600 hover:text-blue-800 text-sm font-medium transition-colors"
          >
            Read more →
          </Link>
        </div>
      </div>
    </div>
  );
};

export default PostCard;
