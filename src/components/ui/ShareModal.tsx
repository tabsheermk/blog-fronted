import React, { useState } from "react";
import {
  XMarkIcon,
  LinkIcon,
  CheckIcon,
  ShareIcon,
} from "@heroicons/react/24/outline";
import { showSuccess, showError } from "../../utils/toast";

interface ShareModalProps {
  isOpen: boolean;
  onClose: () => void;
  postTitle: string;
  postSlug: string;
}

const ShareModal: React.FC<ShareModalProps> = ({
  isOpen,
  onClose,
  postTitle,
  postSlug,
}) => {
  const [copied, setCopied] = useState(false);

  if (!isOpen) return null;

  const postUrl = `${window.origin}/posts/${postSlug}`;

  const copyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(postUrl);
      setCopied(true);
      showSuccess("Link copied to clipboard!");
      setTimeout(() => setCopied(false), 2000);
    } catch {
      showError("Failed to copy link");
    }
  };

  const shareOptions = [
    {
      name: "Twitter",
      icon: "🐦",
      url: `https://twitter.com/intent/tweet?text=${encodeURIComponent(
        postTitle
      )}&url=${encodeURIComponent(postUrl)}`,
      color: "bg-blue-400 hover:bg-blue-500",
    },
    {
      name: "LinkedIn",
      icon: "💼",
      url: `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(
        postUrl
      )}`,
      color: "bg-blue-600 hover:bg-blue-700",
    },
    {
      name: "Facebook",
      icon: "📘",
      url: `https://facebook.com/sharer/sharer.php?u=${encodeURIComponent(
        postUrl
      )}`,
      color: "bg-blue-500 hover:bg-blue-600",
    },
    {
      name: "Reddit",
      icon: "🔶",
      url: `https://reddit.com/submit?url=${encodeURIComponent(
        postUrl
      )}&title=${encodeURIComponent(postTitle)}`,
      color: "bg-orange-500 hover:bg-orange-600",
    },
  ];

  const openShare = (url: string) =>
    window.open(url, "_blank", "width=600,height=400");

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg max-w-md w-full mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <div className="flex items-center space-x-2">
            <ShareIcon className="h-5 w-5 text-gray-600" />
            <h3 className="text-lg font-semibold text-gray-900">Share Post</h3>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors p-2 rounded"
            aria-label="Close modal"
          >
            <XMarkIcon className="h-6 w-6" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6">
          {/* Post Title */}
          <div>
            <h4 className="font-medium text-gray-900 mb-2">Sharing:</h4>
            <p className="text-sm text-gray-600 line-clamp-2">{postTitle}</p>
          </div>

          {/* Copy Link */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Copy Link
            </label>
            <div className="flex flex-col sm:flex-row sm:items-center sm:gap-2">
              <input
                type="text"
                readOnly
                value={postUrl}
                className="flex-1 w-full sm:w-auto px-3 py-2 mb-2 sm:mb-0 border border-gray-300 rounded-md bg-gray-50 text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
              <button
                onClick={copyToClipboard}
                className={`flex items-center justify-center px-4 py-2 rounded-md font-medium transition-colors ${
                  copied
                    ? "bg-green-100 text-green-700"
                    : "bg-blue-600 text-white hover:bg-blue-700"
                }`}
              >
                {copied ? (
                  <>
                    <CheckIcon className="h-4 w-4 mr-1" />
                    <span>Copied!</span>
                  </>
                ) : (
                  <>
                    <LinkIcon className="h-4 w-4 mr-1" />
                    <span>Copy</span>
                  </>
                )}
              </button>
            </div>
          </div>

          {/* Social Share */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-3">
              Share on Social Media
            </label>
            <div className="grid grid-cols-2 gap-3">
              {shareOptions.map(({ name, icon, url, color }) => (
                <button
                  key={name}
                  onClick={() => openShare(url)}
                  className={`${color} text-white px-4 py-3 rounded-md font-medium flex items-center justify-center gap-2 text-base`}
                  type="button"
                >
                  <span>{icon}</span>
                  <span>{name}</span>
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-gray-200 text-right">
          <button
            onClick={onClose}
            className="px-4 py-2 text-gray-600 hover:text-gray-800 font-medium transition-colors rounded"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};

export default ShareModal;
