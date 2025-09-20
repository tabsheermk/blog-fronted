import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import Navbar from "../components/layout/Navbar";
import { postService } from "../services/postsService";
import { useAuth } from "../contexts/AuthContext";
import type { Post } from "../types";
import { showSuccess, showError } from "../utils/toast";
import {
  PencilIcon,
  ArrowLeftIcon,
  ExclamationTriangleIcon,
} from "@heroicons/react/24/outline";

const EditPost: React.FC = () => {
  const { slug } = useParams<{ slug: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();

  const [post, setPost] = useState<Post | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [formData, setFormData] = useState({
    title: "",
    content: "",
    tags: "",
  });

  useEffect(() => {
    if (slug) {
      fetchPost();
    }
  }, [slug]);

  const fetchPost = async () => {
    try {
      setLoading(true);
      setError(null);

      const response = await postService.getPostBySlug(slug!);

      if (response.success) {
        const fetchedPost = response.data.post;

        // Check if current user is the author
        if (user && fetchedPost.author !== user.id) {
          setError("You are not authorized to edit this post");
          return;
        }

        setPost(fetchedPost);
        setFormData({
          title: fetchedPost.title,
          content: fetchedPost.content,
          tags: fetchedPost.tags.join(", "),
        });
      } else {
        setError("Post not found");
      }
    } catch (err: unknown) {
      const error = err as { response?: { data?: { message?: string } } };
      const errorMessage =
        error.response?.data?.message || "Failed to load post";
      setError(errorMessage);
      console.error("Fetch post error:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const processTags = (tagsString: string): string[] => {
    return tagsString
      .split(",")
      .map((tag) => tag.trim().toLowerCase())
      .filter((tag) => tag.length > 0)
      .slice(0, 10); // Limit to 10 tags
  };

  const validateForm = (): boolean => {
    if (!formData.title.trim()) {
      showError("Please enter a title");
      return false;
    }

    if (formData.title.trim().length < 5) {
      showError("Title must be at least 5 characters long");
      return false;
    }

    if (!formData.content.trim()) {
      showError("Please enter content");
      return false;
    }

    if (formData.content.trim().length < 50) {
      showError("Content must be at least 50 characters long");
      return false;
    }

    return true;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm() || !post) return;

    setIsSubmitting(true);

    try {
      const updateData = {
        title: formData.title.trim(),
        content: formData.content.trim(),
        tags: processTags(formData.tags),
      };

      const response = await postService.updatePost(post._id, updateData);

      if (response.success) {
        showSuccess("Post updated successfully!");
        // Navigate to the updated post
        navigate(`/posts/${response.data.post.slug}`);
      }
    } catch (error: unknown) {
      const err = error as { response?: { data?: { message?: string } } };
      const errorMessage =
        err.response?.data?.message || "Failed to update post";
      showError(errorMessage);
      console.error("Update post error:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCancel = () => {
    if (post) {
      navigate(`/posts/${post.slug}`);
    } else {
      navigate("/dashboard");
    }
  };

  const wordCount = formData.content
    .trim()
    .split(/\s+/)
    .filter((word) => word.length > 0).length;
  const readTime = Math.max(1, Math.ceil(wordCount / 200)); // 200 words per minute

  // Check if form has changes
  const hasChanges =
    post &&
    (formData.title !== post.title ||
      formData.content !== post.content ||
      formData.tags !== post.tags.join(", "));

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

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Navbar />
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="text-center py-12">
            <ExclamationTriangleIcon className="h-12 w-12 text-red-500 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              {error}
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
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <button
              onClick={() => navigate(-1)}
              className="flex items-center space-x-2 text-gray-600 hover:text-blue-600 transition-colors"
            >
              <ArrowLeftIcon className="h-4 w-4" />
              <span>Back</span>
            </button>

            {hasChanges && (
              <div className="flex items-center space-x-2 text-amber-600 bg-amber-50 px-3 py-1 rounded-full text-sm">
                <ExclamationTriangleIcon className="h-4 w-4" />
                <span>You have unsaved changes</span>
              </div>
            )}
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-8">
          <div className="mb-8">
            <div className="flex items-center space-x-2 mb-2">
              <PencilIcon className="h-6 w-6 text-blue-600" />
              <h1 className="text-3xl font-bold text-gray-900">Edit Post</h1>
            </div>
            <p className="text-gray-600">
              Make changes to your post and save them when you're ready.
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Title */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Title *
              </label>
              <input
                type="text"
                name="title"
                value={formData.title}
                onChange={handleInputChange}
                disabled={isSubmitting}
                maxLength={200}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:bg-gray-100 disabled:cursor-not-allowed text-lg font-medium"
                placeholder="Enter an engaging title for your post..."
              />
              <div className="mt-1 flex justify-between text-xs text-gray-500">
                <span>Make it catchy and descriptive</span>
                <span>{formData.title.length}/200</span>
              </div>
            </div>

            {/* Tags */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Tags
              </label>
              <input
                type="text"
                name="tags"
                value={formData.tags}
                onChange={handleInputChange}
                disabled={isSubmitting}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:bg-gray-100 disabled:cursor-not-allowed"
                placeholder="react, javascript, web-development, typescript (comma separated)"
              />
              <div className="mt-1 text-xs text-gray-500">
                Add up to 10 relevant tags to help others find your post
              </div>
              {formData.tags && (
                <div className="mt-2 flex flex-wrap gap-2">
                  {processTags(formData.tags).map((tag, index) => (
                    <span
                      key={index}
                      className="px-2 py-1 bg-blue-100 text-blue-700 text-xs font-medium rounded-full"
                    >
                      #{tag}
                    </span>
                  ))}
                </div>
              )}
            </div>

            {/* Content */}
            <div>
              <div className="flex justify-between items-center mb-2">
                <label className="block text-sm font-medium text-gray-700">
                  Content *
                </label>
                <div className="text-xs text-gray-500">
                  {wordCount} words • ~{readTime} min read
                </div>
              </div>
              <textarea
                name="content"
                value={formData.content}
                onChange={handleInputChange}
                disabled={isSubmitting}
                rows={16}
                maxLength={50000}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none disabled:bg-gray-100 disabled:cursor-not-allowed font-mono text-sm leading-relaxed"
                placeholder="Edit your post content..."
              />
              <div className="mt-1 flex justify-between text-xs text-gray-500">
                <span>Minimum 50 characters required</span>
                <span>{formData.content.length}/50,000</span>
              </div>
            </div>

            {/* Preview Section */}
            {formData.content && (
              <div className="border border-gray-200 rounded-lg p-4 bg-gray-50">
                <h4 className="text-sm font-medium text-gray-700 mb-2">
                  Content Preview:
                </h4>
                <div className="text-sm text-gray-600 line-clamp-3">
                  {formData.content.substring(0, 200)}
                  {formData.content.length > 200 && "..."}
                </div>
              </div>
            )}

            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row gap-4 pt-6 border-t border-gray-200">
              <button
                type="button"
                onClick={handleCancel}
                disabled={isSubmitting}
                className="flex items-center justify-center space-x-2 px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 disabled:bg-gray-100 disabled:cursor-not-allowed transition-colors font-medium"
              >
                <span>Cancel</span>
              </button>

              <button
                type="submit"
                disabled={
                  isSubmitting ||
                  !hasChanges ||
                  !formData.title.trim() ||
                  !formData.content.trim()
                }
                className="flex items-center justify-center space-x-2 px-8 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-blue-400 disabled:cursor-not-allowed transition-colors font-medium flex-1 sm:flex-none"
              >
                {isSubmitting ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2 inline-block"></div>
                    <span>Updating...</span>
                  </>
                ) : (
                  <>
                    <PencilIcon className="h-4 w-4" />
                    <span>Update Post</span>
                  </>
                )}
              </button>
            </div>

            {/* Changes Indicator */}
            {hasChanges && (
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <h4 className="text-sm font-semibold text-blue-900 mb-2">
                  📝 Changes Detected:
                </h4>
                <ul className="text-xs text-blue-800 space-y-1">
                  {formData.title !== post?.title && (
                    <li>• Title has been modified</li>
                  )}
                  {formData.content !== post?.content && (
                    <li>• Content has been updated</li>
                  )}
                  {formData.tags !== post?.tags.join(", ") && (
                    <li>• Tags have been changed</li>
                  )}
                </ul>
              </div>
            )}
          </form>
        </div>
      </div>
    </div>
  );
};

export default EditPost;
