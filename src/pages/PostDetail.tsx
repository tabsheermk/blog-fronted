import React, { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import Navbar from "../components/layout/Navbar";
import CommentSection from "../components/comments/CommentSection";
import ShareModal from "../components/ui/ShareModal";
import DeleteConfirmModal from "../components/ui/DeleteConfirmModal";
import { postService } from "../services/postsService";
import type { Post } from "../types";
import { useAuth } from "../contexts/AuthContext";
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
  HandThumbUpIcon as HandThumbUpSolid,
  HandThumbDownIcon as HandThumbDownSolid,
} from "@heroicons/react/24/solid";
import ReactMarkdown from "react-markdown";

const PostDetail: React.FC = () => {
  const { slug } = useParams<{ slug: string }>();
  const navigate = useNavigate();
  const { isAuthenticated, user } = useAuth();

  const [post, setPost] = useState<Post | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [userVote, setUserVote] = useState<"upvote" | "downvote" | null>(null);
  const [isVoting, setIsVoting] = useState(false);
  const [showActionsMenu, setShowActionsMenu] = useState(false);
  const [showShareModal, setShowShareModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  useEffect(() => {
    if (slug) fetchPost();
  }, [slug]);

  useEffect(() => {
    const onClickOutside = () => setShowActionsMenu(false);
    document.addEventListener("click", onClickOutside);
    return () => document.removeEventListener("click", onClickOutside);
  }, []);

  const fetchPost = async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await postService.getPostBySlug(slug!);
      if (res.success) setPost(res.data.post);
      else setError("Post not found");
    } catch (err) {
      const error = err as { response?: { data?: { message?: string } } };
      const msg = error.response?.data?.message ?? "Failed to load post";
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  const handleVote = async (type: "upvote" | "downvote") => {
    if (!isAuthenticated) {
      showError("Please login to vote");
      return;
    }
    if (!post || isVoting) return;
    setIsVoting(true);
    try {
      const res = await postService.votePost(post._id, type);
      if (res.success) {
        setPost((p) =>
          p
            ? {
                ...p,
                votes: res.data.votes as {
                  upvotes: number;
                  downvotes: number;
                  score: number;
                },
              }
            : p
        );
        setUserVote(
          ["upvote", "downvote"].includes(res.data.userVote as string)
            ? (res.data.userVote as "upvote" | "downvote")
            : null
        );
      }
    } catch {
      showError("Failed to vote");
    } finally {
      setIsVoting(false);
    }
  };

  const handleDelete = async () => {
    if (!post) return;
    setIsDeleting(true);
    try {
      await postService.deletePost(post._id);
      showSuccess("Post deleted");
      navigate("/dashboard");
    } catch (err) {
      const error = err as { response?: { data?: { message?: string } } };
      const msg = error.response?.data?.message ?? "Failed to delete post";
      showError(msg);
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

  interface FormatDateOptions {
    year: "numeric";
    month: "long";
    day: "numeric";
  }

  const formatDate = (dateStr: string): string =>
    new Date(dateStr).toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    } as FormatDateOptions);

  const isAuthor = user && post && user.id === post.author;

  if (loading)
    return (
      <div className="min-h-screen flex flex-col bg-gray-50">
        <Navbar />
        <div className="flex-grow flex justify-center items-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-blue-600 mx-auto" />
            <p className="mt-4 text-lg text-gray-600">Loading post...</p>
          </div>
        </div>
      </div>
    );

  if (error || !post)
    return (
      <div className="min-h-screen flex flex-col bg-gray-50">
        <Navbar />
        <div className="flex-grow flex flex-col items-center justify-center px-4">
          <div className="text-center max-w-lg">
            <EllipsisVerticalIcon className="mx-auto mb-4 h-12 w-12 text-red-500" />
            <h3 className="mb-4 text-lg font-semibold">
              {error ?? "Post not found"}
            </h3>
            <button
              onClick={() => navigate("/dashboard")}
              className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded"
            >
              Back to Dashboard
            </button>
          </div>
        </div>
      </div>
    );

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <main className="max-w-full sm:max-w-4xl mx-auto p-0 sm:px-6 lg:px-8 py-6">
        {/* Back Button */}
        <div className="mb-6 flex justify-start">
          <button
            onClick={() => navigate(-1)}
            className="inline-flex items-center space-x-2 rounded-md border border-gray-300 px-3 py-2 text-sm text-gray-700 hover:bg-gray-100 transition"
          >
            <ArrowLeftIcon className="h-5 w-5" />
            <span>Back</span>
          </button>
        </div>

        {/* Post Article */}
        <article className="bg-white rounded-lg border border-gray-200 shadow-sm overflow-hidden">
          {/* Header */}
          <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start gap-5 p-6 border-b border-gray-200">
            <div className="flex items-center gap-4">
              <div className="flex items-center justify-center w-12 h-12 rounded-full bg-gradient-to-r from-blue-500 to-purple-600 text-white font-semibold select-none">
                {post.authorDetails.firstName[0]}
                {post.authorDetails.lastName[0]}
              </div>
              <div>
                <div className="flex flex-col sm:flex-row sm:items-center sm:space-x-3">
                  <div className="flex items-center font-semibold text-gray-900">
                    <UserIcon className="w-5 h-5 mr-1" />
                    {post.authorDetails.firstName} {post.authorDetails.lastName}
                  </div>
                  <div className="flex gap-x-6 text-gray-500 text-xs mt-1 sm:mt-0">
                    <time className="flex items-center gap-1 whitespace-nowrap">
                      <CalendarIcon className="w-4 h-4" />{" "}
                      {formatDate(post.createdAt)}
                    </time>
                    <div className="flex items-center gap-1 whitespace-nowrap">
                      <ClockIcon className="w-4 h-4" /> {post.readTime} min read
                    </div>
                    <div className="flex items-center gap-1 whitespace-nowrap">
                      <EyeIcon className="w-4 h-4" /> {post.views} views
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="relative">
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  setShowActionsMenu((v) => !v);
                }}
                className="p-2 rounded-md text-gray-400 hover:bg-gray-100 hover:text-gray-600"
                aria-label="Toggle menu"
              >
                <EllipsisVerticalIcon className="w-5 h-5" />
              </button>
              {showActionsMenu && (
                <div className="absolute right-0 mt-2 w-48 rounded-md border border-gray-200 bg-white shadow-lg z-20">
                  <button
                    onClick={handleShare}
                    className="flex w-full items-center px-4 py-2 text-gray-700 hover:bg-gray-50 space-x-2"
                  >
                    <ShareIcon className="w-4 h-4" />
                    <span>Share Post</span>
                  </button>
                  {isAuthor && (
                    <>
                      <button
                        onClick={handleEdit}
                        className="flex w-full items-center px-4 py-2 text-gray-700 hover:bg-gray-50 space-x-2"
                      >
                        <PencilIcon className="w-4 h-4" />
                        <span>Edit Post</span>
                      </button>
                      <div className="border-t border-gray-200 my-1" />
                      <button
                        onClick={() => {
                          setShowDeleteModal(true);
                          setShowActionsMenu(false);
                        }}
                        className="flex w-full items-center px-4 py-2 text-red-600 hover:bg-red-50 space-x-2"
                      >
                        <TrashIcon className="w-4 h-4" />
                        <span>Delete Post</span>
                      </button>
                    </>
                  )}
                </div>
              )}
            </div>
          </div>

          {/* Title */}
          <h1 className="px-6 sm:px-8 py-6 text-left font-extrabold text-3xl sm:text-4xl leading-tight tracking-tight text-gray-900">
            {post.title}
          </h1>

          {/* Tags */}
          <div className="px-6 sm:px-8 mb-6 flex flex-wrap gap-2">
            {post.tags.map((tag) => (
              <span
                key={tag}
                className="bg-blue-100 text-blue-700 rounded-full px-3 py-1 text-sm"
              >{`#${tag}`}</span>
            ))}
          </div>

          {/* Voting and Share */}
          <div className="px-6 sm:px-8 py-6 border-t border-gray-200 flex flex-wrap gap-4 space-x-4 items-center">
            <button
              onClick={() => handleVote("upvote")}
              disabled={isVoting || !isAuthenticated || !!isAuthor}
              className={`flex items-center gap-1 border px-4 py-2 rounded-lg text-sm transition ${
                userVote === "upvote"
                  ? "bg-green-100 text-green-700"
                  : "border-gray-300 text-gray-600 hover:bg-gray-50"
              } disabled:opacity-50 disabled:cursor-not-allowed`}
            >
              {userVote === "upvote" ? (
                <HandThumbUpSolid className="w-5 h-5" />
              ) : (
                <HandThumbUpIcon className="w-5 h-5" />
              )}
              <span>{post.votes.upvotes}</span>
            </button>
            <button
              onClick={() => handleVote("downvote")}
              disabled={isVoting || !isAuthenticated || !!isAuthor}
              className={`flex items-center gap-1 border px-4 py-2 rounded-lg text-sm transition ${
                userVote === "downvote"
                  ? "bg-red-100 text-red-700"
                  : "border-gray-300 text-gray-600 hover:bg-gray-50"
              } disabled:opacity-50 disabled:cursor-not-allowed`}
            >
              {userVote === "downvote" ? (
                <HandThumbDownSolid className="w-5 h-5" />
              ) : (
                <HandThumbDownIcon className="w-5 h-5" />
              )}
              <span>{post.votes.downvotes}</span>
            </button>
            <span className="text-gray-600 text-sm whitespace-nowrap">
              Score: <strong>{post.votes.score}</strong>
            </span>
            <button
              onClick={handleShare}
              className="ml-auto border border-gray-300 rounded-lg px-4 py-2 text-sm flex items-center space-x-2 hover:bg-gray-50"
            >
              <ShareIcon className="w-4 h-4" />
              <span>Share</span>
            </button>
          </div>

          {/* Post content */}
          <div className="prose max-w-none px-6 sm:px-8 mx-auto text-left pb-12">
            <ReactMarkdown>{post.content}</ReactMarkdown>
          </div>

          {/* Comments */}
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
            <CommentSection postId={post._id} />
          </div>
        </article>
      </main>

      <ShareModal
        isOpen={showShareModal}
        onClose={() => setShowShareModal(false)}
        postTitle={post.title}
        postSlug={post.slug}
      />

      <DeleteConfirmModal
        isOpen={showDeleteModal}
        onClose={() => !isDeleting && setShowDeleteModal(false)}
        onConfirm={handleDelete}
        isDeleting={isDeleting}
        postTitle={post.title}
      />
    </div>
  );
};

export default PostDetail;
