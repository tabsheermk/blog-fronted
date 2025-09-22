import React, { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import Navbar from "../components/layout/Navbar";
import MdEditor from "react-markdown-editor-lite";
import "react-markdown-editor-lite/lib/index.css";
import ReactMarkdown from "react-markdown";
// import CommentForm from "../components/CommentForm";
import {
  ArrowLeftIcon,
  PencilIcon,
  ExclamationTriangleIcon,
} from "@heroicons/react/24/outline";
import { postService } from "../services/postsService";
import { useAuth } from "../contexts/AuthContext";
import { showError, showSuccess } from "../utils/toast";
import type { Post } from "../types";

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
    if (slug) fetchPost();
  }, [slug]);

  const fetchPost = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await postService.getPostBySlug(slug!);
      if (response.success) {
        const fetchedPost = response.data.post;
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
        error?.response?.data?.message || "Failed to load post";
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const processTags = (tagsString: string): string[] =>
    tagsString
      .split(",")
      .map((tag) => tag.trim().toLowerCase())
      .filter((tag) => tag.length > 0)
      .slice(0, 10);

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
        navigate(`/posts/${response.data.post.slug}`);
      }
    } catch (err: unknown) {
      const error = err as { response?: { data?: { message?: string } } };
      const errorMessage =
        error?.response?.data?.message || "Failed to update post";
      showError(errorMessage);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCancel = () => {
    if (post) navigate(`/posts/${post.slug}`);
    else navigate("/dashboard");
  };

  const wordCount = formData.content
    .trim()
    .split(/\s+/)
    .filter((w) => w.length > 0).length;
  const readTime = Math.max(1, Math.ceil(wordCount / 200));

  const hasChanges =
    post &&
    (formData.title !== post.title ||
      formData.content !== post.content ||
      formData.tags !== post.tags.join(", "));

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
        <Navbar />
        <div className="max-w-4xl w-full mx-auto px-4 py-10">
          <div className="text-center">
            <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-blue-600 mx-auto"></div>
            <p className="mt-4 text-gray-600">Loading post...</p>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center px-4">
        <Navbar />
        <div className="max-w-4xl w-full mx-auto px-4 py-10">
          <div className="text-center">
            <ExclamationTriangleIcon className="mx-auto mb-4 h-12 w-12 text-red-500" />
            <h3 className="mb-2 text-lg font-semibold text-gray-900">
              {error}
            </h3>
            <button
              onClick={() => navigate("/dashboard")}
              className="inline-block bg-blue-600 px-6 py-2 rounded-lg text-white font-medium hover:bg-blue-700 transition"
            >
              Back to Dashboard
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col px-4 py-10">
      <Navbar />
      <main className="max-w-4xl w-full mx-auto">
        <div className="mb-8 flex flex-col sm:flex-row items-center justify-between space-y-4 sm:space-y-0">
          <button
            onClick={() => navigate(-1)}
            className="flex items-center space-x-2 text-gray-600 hover:text-blue-600 transition"
          >
            <ArrowLeftIcon className="h-4 w-4" />
            <span>Back</span>
          </button>
          {hasChanges && (
            <div className="flex items-center space-x-2 bg-yellow-100 text-yellow-800 px-3 py-1 rounded-full text-sm">
              <PencilIcon className="h-4 w-4" />
              <span>Unsaved changes</span>
            </div>
          )}
        </div>
        <section className="bg-white rounded-lg border border-gray-200 p-6 shadow-sm">
          <header className="mb-6">
            <div className="flex items-center space-x-2 mb-2">
              <PencilIcon className="h-6 w-6 text-blue-600" />
              <h1 className="text-3xl font-bold text-gray-900">Edit Post</h1>
            </div>
            <p className="text-gray-600">
              Make changes to your post and save when ready.
            </p>
          </header>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label className="block mb-1 text-sm font-medium text-gray-700">
                Title *
              </label>
              <input
                type="text"
                name="title"
                value={formData.title}
                onChange={handleInputChange}
                disabled={isSubmitting}
                maxLength={200}
                placeholder="Enter post title"
                className="w-full rounded-md border border-gray-300 px-4 py-3 text-lg font-medium focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:bg-gray-100 disabled:cursor-not-allowed"
              />
              <div className="mt-1 flex justify-between text-xs text-gray-500">
                <span>Make it catchy and descriptive</span>
                <span>{formData.title.length}/200</span>
              </div>
            </div>

            <div>
              <label className="block mb-1 text-sm font-medium text-gray-700">
                Tags
              </label>
              <input
                type="text"
                name="tags"
                value={formData.tags}
                onChange={handleInputChange}
                disabled={isSubmitting}
                placeholder="react, javascript, web development"
                className="w-full rounded-md border border-gray-300 px-4 py-3 text-base focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:bg-gray-100 disabled:cursor-not-allowed"
              />
              <div className="mt-1 text-sm text-gray-500">
                Add up to 10 tags, comma separated
              </div>
            </div>

            <div>
              <label className="block mb-1 text-sm font-medium text-gray-700 flex justify-between">
                <span>Content *</span>
                <span className="text-xs text-gray-500">
                  {wordCount} words • {readTime} min read
                </span>
              </label>
              <MdEditor
                value={formData.content}
                style={{ height: "400px" }}
                renderHTML={(text) => <ReactMarkdown>{text}</ReactMarkdown>}
                onChange={({ text }) =>
                  setFormData((prev) => ({ ...prev, content: text }))
                }
                readOnly={isSubmitting}
                placeholder="Edit post content using markdown"
              />
              <div className="mt-1 flex justify-between text-xs text-gray-500">
                <span>Min 50 characters required</span>
                <span>{formData.content.length}/50,000</span>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row gap-4 border-t border-gray-200 pt-6">
              <button
                type="button"
                onClick={handleCancel}
                disabled={isSubmitting}
                className="rounded-md border border-gray-300 px-6 py-3 text-gray-700 hover:bg-gray-50 disabled:bg-gray-100 disabled:cursor-not-allowed"
              >
                Cancel
              </button>

              <button
                type="submit"
                disabled={
                  isSubmitting ||
                  !hasChanges ||
                  !formData.title.trim() ||
                  !formData.content.trim()
                }
                className="rounded-md bg-blue-600 px-8 py-3 text-white hover:bg-blue-700 disabled:bg-blue-400 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                {isSubmitting ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                    Updating...
                  </>
                ) : (
                  <>
                    <PencilIcon className="h-5 w-5" />
                    Update Post
                  </>
                )}
              </button>
            </div>
          </form>
        </section>
      </main>
    </div>
  );
};

export default EditPost;
