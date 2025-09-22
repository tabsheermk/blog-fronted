import React, { useState } from "react";
import { useAuth } from "../../contexts/AuthContext";
import { showError } from "../../utils/toast";
import { PaperAirplaneIcon } from "@heroicons/react/24/outline";

interface CommentFormProps {
  onSubmit: (content: string) => Promise<void>;
  placeholder?: string;
  buttonText?: string;
  autoFocus?: boolean;
  onCancel?: () => void;
  isReply?: boolean;
}

const CommentForm: React.FC<CommentFormProps> = ({
  onSubmit,
  placeholder = "Write a comment...",
  buttonText = "Comment",
  autoFocus = false,
  onCancel,
  isReply = false,
}) => {
  const { isAuthenticated } = useAuth();
  const [content, setContent] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!isAuthenticated) {
      showError("Please login to comment");
      return;
    }

    if (!content.trim()) {
      showError("Please enter a comment");
      return;
    }

    if (content.trim().length > 1000) {
      showError("Comment is too long (max 1000 characters)");
      return;
    }

    setIsSubmitting(true);
    try {
      await onSubmit(content.trim());
      setContent("");
    } catch (error) {
      console.error("Submit comment error", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isAuthenticated) {
    return (
      <div className="bg-gray-50 border border-gray-200 rounded-lg p-4 text-center max-w-md mx-auto">
        <p className="text-gray-600 mb-4">
          Please login to join the discussion
        </p>
        <button
          onClick={() => (window.location.href = "/login")}
          className="bg-blue-600 text-white w-full max-w-xs mx-auto px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
        >
          Login
        </button>
      </div>
    );
  }

  return (
    <form
      onSubmit={handleSubmit}
      className={`${
        isReply ? "bg-gray-50" : "bg-white"
      } border border-gray-200 rounded-lg p-4 max-w-full md:max-w-2xl mx-auto`}
    >
      <div className="space-y-3">
        <textarea
          value={content}
          onChange={(e) => setContent(e.target.value)}
          placeholder={placeholder}
          autoFocus={autoFocus}
          disabled={isSubmitting}
          maxLength={1000}
          rows={isReply ? 3 : 5}
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none disabled:bg-gray-100 disabled:cursor-not-allowed text-sm md:text-base"
        />
        <div className="flex flex-col sm:flex-row justify-between items-center gap-3">
          <div className="text-xs text-gray-500">
            {content.length}/1000 characters
          </div>
          <div className="flex items-center space-x-2">
            {onCancel && (
              <button
                type="button"
                onClick={onCancel}
                disabled={isSubmitting}
                className="px-4 py-2 text-gray-600 hover:text-gray-800 disabled:opacity-50 disabled:cursor-not-allowed transition-colors rounded"
              >
                Cancel
              </button>
            )}
            <button
              type="submit"
              disabled={isSubmitting || !content.trim()}
              className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:bg-blue-400 disabled:cursor-not-allowed transition-colors text-sm md:text-base"
            >
              {isSubmitting ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  <span>Posting...</span>
                </>
              ) : (
                <>
                  <PaperAirplaneIcon className="h-4 w-4 mr-1" />
                  <span>{buttonText}</span>
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </form>
  );
};

export default CommentForm;
