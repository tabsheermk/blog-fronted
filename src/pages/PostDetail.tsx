import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import Navbar from "../components/layout/Navbar";
import CommentSection from "../components/comments/CommentSection";
import ShareModal from "../components/ui/ShareModal";
import DeleteConfirmModal from "../components/ui/DeleteConfirmModal";
import { postService } from "../services/postsService";
import { useAuth } from "../contexts/AuthContext";
import type { Post } from "../types";
import { showError, showSuccess } from "../utils/toast";
import {
  HandThumbUpIcon,
  HandThumbDownIcon,
  EyeIcon,
  ClockIcon,
  CalendarIcon,
  UserIcon,
  ArrowLeftIcon,
  ShareIcon,
  PencilIcon,
  TrashIcon,
  EllipsisVerticalIcon,
} from "@heroicons/react/24/outline";
import {
  HandThumbUpIcon as HandThumbUpSolidIcon,
  HandThumbDownIcon as HandThumbDownSolidIcon,
} from "@heroicons/react/24/solid";

const PostDetail: React.FC = () => {
  const { slug } = useParams<{ slug: string }>();
  const navigate = useNavigate();
  const { isAuthenticated, user } = useAuth();

  const [post, setPost] = useState<Post | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [userVote, setUserVote] = useState<"upvote" | "downvote" | null>(null);
  const [isVoting, setIsVoting] = useState(false);
  const [showShareModal, setShowShareModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [showActionsMenu, setShowActionsMenu] = useState(false);

  useEffect(() => {
    if (slug) {
      fetchPost();
    }
  }, [slug]);

  // Close actions menu when clicking outside
  useEffect(() => {
    const handleClickOutside = () => {
      setShowActionsMenu(false);
    };

    document.addEventListener("click", handleClickOutside);
    return () => document.removeEventListener("click", handleClickOutside);
  }, []);

  const fetchPost = async () => {
    try {
      setLoading(true);
      setError(null);

      const response = await postService.getPostBySlug(slug!);

      if (response.success) {
        setPost(response.data.post);
      } else {
        setError("Post not found");
      }
    } catch (err: unknown) {
      const errorMessage =
        (err as { response?: { data?: { message?: string } } }).response?.data
          ?.message || "Failed to load post";
      setError(errorMessage);
      console.error("Fetch post error:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleVote = async (voteType: "upvote" | "downvote") => {
    if (!isAuthenticated) {
      showError("Please login to vote on posts");
      return;
    }

    if (!post || isVoting) return;

    setIsVoting(true);
    try {
      const response = await postService.votePost(post._id, voteType);

      if (response.success) {
        setPost((prev) =>
          prev
            ? {
                ...prev,
                votes: response.data.votes as {
                  upvotes: number;
                  downvotes: number;
                  score: number;
                },
              }
            : null
        );
        const validVote =
          response.data.userVote === "upvote" ||
          response.data.userVote === "downvote"
            ? response.data.userVote
            : null;
        setUserVote(validVote);
      }
    } catch (error: unknown) {
      const err = error as { response?: { data?: { message?: string } } };
      const errorMessage = err.response?.data?.message || "Failed to vote";
      showError(errorMessage);
    } finally {
      setIsVoting(false);
    }
  };

  const handleDelete = async () => {
    if (!post) return;

    setIsDeleting(true);
    try {
      await postService.deletePost(post._id);
      showSuccess("Post deleted successfully!");
      navigate("/dashboard");
    } catch (error: unknown) {
      const err = error as { response?: { data?: { message?: string } } };
      const errorMessage =
        err.response?.data?.message || "Failed to delete post";
      showError(errorMessage);
      setIsDeleting(false);
      setShowDeleteModal(false);
    }
  };

  const handleShare = () => {
    setShowShareModal(true);
    setShowActionsMenu(false);
  };

  const handleEdit = () => {
    if (!post) return;
    navigate(`/posts/${post.slug}/edit`);
    setShowActionsMenu(false);
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  const formatContent = (content: string) => {
    return content.split("\n").map((line, index) => (
      <p key={index} className="mb-4 last:mb-0">
        {line}
      </p>
    ));
  };

  // Check if current user is the post author
  const isAuthor = user && post && post.author === user.id;

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Navbar />
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-blue-600 mx-auto"></div>
            <p className="mt-4 text-gray-600">Loading post...</p>
          </div>
        </div>
      </div>
    );
  }

  if (error || !post) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Navbar />
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="text-center py-12">
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              {error || "Post not found"}
            </h3>
            <button
              onClick={() => navigate("/dashboard")}
              className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
            >
              Back to Dashboard
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Back Navigation */}
        <div className="mb-6">
          <button
            onClick={() => navigate(-1)}
            className="flex items-center space-x-2 text-gray-600 hover:text-blue-600 transition-colors"
          >
            <ArrowLeftIcon className="h-4 w-4" />
            <span>Back</span>
          </button>
        </div>

        {/* Post Content */}
        <article className="bg-white rounded-lg shadow-sm border border-gray-200">
          {/* Post Header */}
          <div className="p-8 border-b border-gray-200">
            <div className="flex items-start justify-between mb-6">
              <div className="flex items-center space-x-4">
                <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white font-semibold text-lg">
                  {post.authorDetails.firstName[0]}
                  {post.authorDetails.lastName[0]}
                </div>
                <div>
                  <div className="flex items-center space-x-2">
                    <UserIcon className="h-4 w-4 text-gray-500" />
                    <p className="font-medium text-gray-900">
                      {post.authorDetails.firstName}{" "}
                      {post.authorDetails.lastName}
                    </p>
                  </div>
                  <div className="flex items-center space-x-4 text-sm text-gray-500 mt-1">
                    <div className="flex items-center space-x-1">
                      <CalendarIcon className="h-3 w-3" />
                      <span>{formatDate(post.createdAt)}</span>
                    </div>
                    <div className="flex items-center space-x-1">
                      <ClockIcon className="h-3 w-3" />
                      <span>{post.readTime} min read</span>
                    </div>
                    <div className="flex items-center space-x-1">
                      <EyeIcon className="h-3 w-3" />
                      <span>{post.views} views</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Actions Menu */}
              <div className="relative">
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    setShowActionsMenu(!showActionsMenu);
                  }}
                  className="text-gray-400 hover:text-gray-600 p-2 rounded-lg hover:bg-gray-100 transition-colors"
                >
                  <EllipsisVerticalIcon className="h-5 w-5" />
                </button>

                {showActionsMenu && (
                  <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg border border-gray-200 py-2 z-10">
                    <button
                      onClick={handleShare}
                      className="flex items-center space-x-2 w-full px-4 py-2 text-left text-gray-700 hover:bg-gray-50 transition-colors"
                    >
                      <ShareIcon className="h-4 w-4" />
                      <span>Share Post</span>
                    </button>

                    {isAuthor && (
                      <>
                        <button
                          onClick={handleEdit}
                          className="flex items-center space-x-2 w-full px-4 py-2 text-left text-gray-700 hover:bg-gray-50 transition-colors"
                        >
                          <PencilIcon className="h-4 w-4" />
                          <span>Edit Post</span>
                        </button>

                        <div className="border-t border-gray-200 my-1"></div>

                        <button
                          onClick={() => {
                            setShowDeleteModal(true);
                            setShowActionsMenu(false);
                          }}
                          className="flex items-center space-x-2 w-full px-4 py-2 text-left text-red-600 hover:bg-red-50 transition-colors"
                        >
                          <TrashIcon className="h-4 w-4" />
                          <span>Delete Post</span>
                        </button>
                      </>
                    )}
                  </div>
                )}
              </div>
            </div>

            <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4 leading-tight">
              {post.title}
            </h1>

            {/* Tags */}
            <div className="flex flex-wrap gap-2 mb-6">
              {post.tags.map((tag) => (
                <span
                  key={tag}
                  className="px-3 py-1 bg-blue-100 text-blue-700 text-sm font-medium rounded-full"
                >
                  #{tag}
                </span>
              ))}
            </div>

            {/* Voting Section */}
            <div className="flex items-center space-x-6">
              <div className="flex items-center space-x-2">
                <button
                  onClick={() => handleVote("upvote")}
                  disabled={isVoting || !isAuthenticated}
                  className={`flex items-center space-x-2 px-4 py-2 rounded-lg transition-colors ${
                    userVote === "upvote"
                      ? "bg-green-100 text-green-700"
                      : "hover:bg-green-50 text-gray-600 border border-gray-300"
                  } disabled:opacity-50 disabled:cursor-not-allowed`}
                >
                  {userVote === "upvote" ? (
                    <HandThumbUpSolidIcon className="h-5 w-5" />
                  ) : (
                    <HandThumbUpIcon className="h-5 w-5" />
                  )}
                  <span className="font-medium">{post.votes.upvotes}</span>
                </button>

                <button
                  onClick={() => handleVote("downvote")}
                  disabled={isVoting || !isAuthenticated}
                  className={`flex items-center space-x-2 px-4 py-2 rounded-lg transition-colors ${
                    userVote === "downvote"
                      ? "bg-red-100 text-red-700"
                      : "hover:bg-red-50 text-gray-600 border border-gray-300"
                  } disabled:opacity-50 disabled:cursor-not-allowed`}
                >
                  {userVote === "downvote" ? (
                    <HandThumbDownSolidIcon className="h-5 w-5" />
                  ) : (
                    <HandThumbDownIcon className="h-5 w-5" />
                  )}
                  <span className="font-medium">{post.votes.downvotes}</span>
                </button>
              </div>

              <div className="text-sm text-gray-600">
                Score: <span className="font-medium">{post.votes.score}</span>
              </div>

              {/* Quick Share Button */}
              <button
                onClick={handleShare}
                className="flex items-center space-x-2 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
              >
                <ShareIcon className="h-4 w-4" />
                <span>Share</span>
              </button>
            </div>
          </div>

          {/* Post Body */}
          <div className="p-8">
            <div className="prose prose-lg max-w-none text-gray-800 leading-relaxed">
              {formatContent(post.content)}
            </div>
          </div>
        </article>

        {/* Comments Section */}
        <div className="mt-8">
          <CommentSection postId={post._id} />
        </div>
      </div>

      {/* Share Modal */}
      <ShareModal
        isOpen={showShareModal}
        onClose={() => setShowShareModal(false)}
        postTitle={post.title}
        postSlug={post.slug}
      />

      {/* Delete Confirmation Modal */}
      <DeleteConfirmModal
        isOpen={showDeleteModal}
        onClose={() => !isDeleting && setShowDeleteModal(false)}
        onConfirm={handleDelete}
        postTitle={post.title}
        isDeleting={isDeleting}
      />
    </div>
  );
};

export default PostDetail;
