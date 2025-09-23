import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import Navbar from "../components/layout/Navbar";
import { postService } from "../services/postsService";
import { showSuccess, showError } from "../utils/toast";
import { PaperAirplaneIcon } from "@heroicons/react/24/outline";
import MdEditor from "react-markdown-editor-lite";
import "react-markdown-editor-lite/lib/index.css";
import ReactMarkdown from "react-markdown";

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
      showError("Please enter at least 50 characters");
      return false;
    }
    return true;
  };

  const handleSubmit = async (e: React.FormEvent) => {
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
        showSuccess("🎉 Post published successfully!");
        navigate(`/posts/${response.data.post.slug}`);
      }
    } catch (error) {
      const err = error as { response?: { data?: { message: string } } };
      const errorMessage =
        err.response?.data?.message || "Failed to create post";
      showError(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  const handleCancel = () => navigate("/dashboard");

  const wordCount = formData.content
    .trim()
    .split(/\s+/)
    .filter((w) => w.length > 0).length;
  const readTime = Math.max(1, Math.ceil(wordCount / 200));

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <main className="max-w-4xl mx-auto p-0 sm:px-6 lg:px-8 py-10">
        <section className="bg-white rounded-lg border border-gray-200 shadow p-6">
          <header className="mb-6 text-center sm:text-left">
            <h1 className="text-3xl sm:text-4xl font-bold mb-1">
              Write a New Post
            </h1>
            <p className="text-lg sm:text-xl text-gray-600">
              Share your knowledge with the community
            </p>
          </header>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label className="block text-sm font-medium mb-1" htmlFor="title">
                Title *
              </label>
              <input
                id="title"
                name="title"
                type="text"
                value={formData.title}
                onChange={handleInputChange}
                disabled={isLoading}
                maxLength={200}
                placeholder="Enter a catchy title"
                className="w-full rounded border border-gray-300 px-4 py-3 text-lg font-medium focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:bg-gray-100 disabled:cursor-not-allowed"
                autoComplete="off"
              />
              <div className="mt-1 flex justify-between text-xs text-gray-500">
                <span>Make it catchy and descriptive</span>
                <span>{formData.title.length}/200</span>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium mb-1" htmlFor="tags">
                Tags
              </label>
              <input
                id="tags"
                name="tags"
                type="text"
                value={formData.tags}
                onChange={handleInputChange}
                disabled={isLoading}
                placeholder="react, javascript, web-development (comma separated)"
                className="w-full rounded border border-gray-300 px-4 py-3 text-base focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:bg-gray-100 disabled:cursor-not-allowed"
                autoComplete="off"
              />
              <p className="mt-1 text-xs text-gray-500">Add up to 10 tags</p>
            </div>

            <div>
              <label
                htmlFor="content"
                className="flex justify-between items-center mb-2 text-sm font-medium"
              >
                <span>Content *</span>
                <span className="text-xs text-gray-500">
                  {wordCount} words • {readTime} min read
                </span>
              </label>
              <MdEditor
                id="content"
                value={formData.content}
                style={{ height: "400px" }}
                renderHTML={(text) => <ReactMarkdown>{text}</ReactMarkdown>}
                onChange={({ text }) =>
                  setFormData((prev) => ({ ...prev, content: text }))
                }
                readOnly={isLoading}
                config={{ view: { menu: true, md: true, html: false } }}
              />
              <div className="mt-1 flex justify-between text-xs text-gray-500">
                <span>Minimum 50 characters required</span>
                <span>{formData.content.length}/50,000</span>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row gap-4 border-t border-gray-200 pt-6">
              <button
                type="button"
                onClick={handleCancel}
                disabled={isLoading}
                className="rounded border border-gray-300 px-6 py-3 text-center text-base w-full sm:w-auto text-gray-700 hover:bg-gray-100 disabled:bg-gray-100 disabled:cursor-not-allowed transition-colors"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={
                  isLoading ||
                  !formData.title.trim() ||
                  !formData.content.trim()
                }
                className="rounded bg-blue-600 px-6 py-3 w-full sm:w-auto text-center text-base text-white hover:bg-blue-700 disabled:bg-blue-400 disabled:cursor-not-allowed transition-colors flex items-center justify-center gap-2"
              >
                {isLoading ? (
                  <>
                    <div className="animate-spin rounded-full h-5 w-5 border-4 border-t-transparent border-white"></div>
                    Publishing...
                  </>
                ) : (
                  <>
                    <PaperAirplaneIcon className="h-5 w-5" />
                    Publish
                  </>
                )}
              </button>
            </div>

            <aside className="mt-8 bg-blue-50 border border-blue-200 rounded p-4 text-blue-900 text-sm">
              <h2 className="font-semibold mb-2">✨ Writing Tips</h2>
              <ul className="list-disc list-inside space-y-1">
                <li>Start with a compelling introduction</li>
                <li>Use headings, code, and lists for clarity</li>
                <li>Show code examples and practical insights</li>
                <li>End with a conclusion or call-to-action</li>
                <li>Use relevant tags</li>
              </ul>
            </aside>
          </form>
        </section>
      </main>
    </div>
  );
};

export default Write;
