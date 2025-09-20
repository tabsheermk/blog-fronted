import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import Navbar from "../components/layout/Navbar";
import { postService } from "../services/postsService";
import { showSuccess, showError } from "../utils/toast";
import { PaperAirplaneIcon, DocumentIcon } from "@heroicons/react/24/outline";

interface FormData {
  title: string;
  content: string;
  tags: string;
}

const Write: React.FC = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState<FormData>({
    title: "",
    content: "",
    tags: "",
  });
  const [isLoading, setIsLoading] = useState(false);
  const [isDraft, setIsDraft] = useState(false);

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

  const handleSubmit = async (
    e: React.FormEvent,
    isPublished: boolean = true
  ) => {
    e.preventDefault();

    if (!validateForm()) return;

    setIsLoading(true);

    try {
      const postData = {
        title: formData.title.trim(),
        content: formData.content.trim(),
        tags: processTags(formData.tags),
      };

      const response = await postService.createPost(postData);

      if (response.success) {
        showSuccess(
          isPublished
            ? "🎉 Post published successfully!"
            : "💾 Draft saved successfully!"
        );

        // Navigate to the created post or dashboard
        navigate("/dashboard");
      }
    } catch (error: unknown) {
      const err = error as { response?: { data?: { message?: string } } };
      const errorMessage =
        err.response?.data?.message || "Failed to create post";
      showError(errorMessage);
      console.error("Create post error:", error);
    } finally {
      setIsLoading(false);
      setIsDraft(false);
    }
  };

  const handleSaveDraft = (e: React.FormEvent) => {
    setIsDraft(true);
    handleSubmit(e, false);
  };

  const handlePublish = (e: React.FormEvent) => {
    handleSubmit(e, true);
  };

  const wordCount = formData.content
    .trim()
    .split(/\s+/)
    .filter((word) => word.length > 0).length;
  const readTime = Math.max(1, Math.ceil(wordCount / 200)); // 200 words per minute

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-8">
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">
              Write a New Post
            </h1>
            <p className="text-gray-600">
              Share your knowledge with the tech community
            </p>
          </div>

          <form className="space-y-6">
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
                disabled={isLoading}
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
                disabled={isLoading}
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
                disabled={isLoading}
                rows={16}
                maxLength={50000}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none disabled:bg-gray-100 disabled:cursor-not-allowed font-mono text-sm leading-relaxed"
                placeholder="Start writing your post..."
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
                onClick={handleSaveDraft}
                disabled={
                  isLoading ||
                  !formData.title.trim() ||
                  !formData.content.trim()
                }
                className="flex items-center justify-center space-x-2 px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 disabled:bg-gray-100 disabled:cursor-not-allowed transition-colors font-medium"
              >
                <DocumentIcon className="h-4 w-4" />
                <span>
                  {isDraft && isLoading ? "Saving Draft..." : "Save Draft"}
                </span>
              </button>

              <button
                type="button"
                onClick={handlePublish}
                disabled={
                  isLoading ||
                  !formData.title.trim() ||
                  !formData.content.trim()
                }
                className="flex items-center justify-center space-x-2 px-8 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-blue-400 disabled:cursor-not-allowed transition-colors font-medium flex-1 sm:flex-none"
              >
                <PaperAirplaneIcon className="h-4 w-4" />
                <span>
                  {!isDraft && isLoading ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2 inline-block"></div>
                      Publishing...
                    </>
                  ) : (
                    "Publish Post"
                  )}
                </span>
              </button>
            </div>

            {/* Writing Tips */}
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <h4 className="text-sm font-semibold text-blue-900 mb-2">
                ✨ Writing Tips:
              </h4>
              <ul className="text-xs text-blue-800 space-y-1">
                <li>
                  • Start with a compelling introduction that hooks your readers
                </li>
                <li>
                  • Use clear headings and subheadings to organize your content
                </li>
                <li>• Include code examples and practical insights</li>
                <li>• End with a conclusion or call-to-action</li>
                <li>
                  • Choose relevant tags to help others discover your post
                </li>
              </ul>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default Write;
