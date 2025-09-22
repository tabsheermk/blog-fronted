import React, { useState, useMemo } from "react";
import Navbar from "../components/layout/Navbar";
import PostCard from "../components/ui/PostCard";
import { usePosts } from "../hooks/usePosts";
import { useAuth } from "../contexts/AuthContext";
import {
  FireIcon,
  ClockIcon,
  TrophyIcon,
  MagnifyingGlassIcon,
  ExclamationTriangleIcon,
} from "@heroicons/react/24/outline";

const Dashboard: React.FC = () => {
  const [sortBy, setSortBy] = useState<"popular" | "latest" | "oldest">(
    "popular"
  );
  const [searchTerm, setSearchTerm] = useState("");
  const [debouncedSearchTerm, setDebouncedSearchTerm] = useState(searchTerm);
  const [viewMyPosts, setViewMyPosts] = useState(false);
  const { user } = useAuth();

  // Debounce search term
  React.useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearchTerm(searchTerm);
    }, 500);
    return () => clearTimeout(timer);
  }, [searchTerm]);

  // Memoize options for posts hook, with author if "My Posts"
  const postsOptions = useMemo(
    () => ({
      sort: sortBy,
      search: debouncedSearchTerm || undefined,
      limit: 10,
      author: viewMyPosts && user ? user.id : undefined,
    }),
    [sortBy, debouncedSearchTerm, viewMyPosts, user]
  );

  // Fetch posts with current filters
  const postsQuery = usePosts(postsOptions);

  // Stats
  const stats = useMemo(() => {
    const totalUpvotes = postsQuery.posts.reduce(
      (sum, post) => sum + post.votes.upvotes,
      0
    );
    const totalReadTime = postsQuery.posts.reduce(
      (sum, post) => sum + post.readTime,
      0
    );

    return {
      totalPosts: postsQuery.pagination?.totalPosts || 0,
      totalUpvotes,
      totalReadTime,
    };
  }, [postsQuery.posts, postsQuery.pagination]);

  const handleSortChange = (newSort: "popular" | "latest" | "oldest") => {
    setSortBy(newSort);
  };

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Search handled by debounced state
  };

  if (postsQuery.error && postsQuery.posts.length === 0) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Navbar />
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="text-center py-12">
            <ExclamationTriangleIcon className="h-12 w-12 text-red-500 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              Failed to load posts
            </h3>
            <p className="text-gray-600 mb-4">{postsQuery.error}</p>
            <button
              onClick={postsQuery.refetch}
              className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
            >
              Try Again
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />

      {/* Main Content */}
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header: Welcome + Toggle */}
        <div className="mb-8 flex flex-col md:flex-row md:items-end md:justify-between gap-2">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">
              Welcome back! 👋
            </h1>
            <p className="text-lg text-gray-600">
              {viewMyPosts
                ? "Review your own blog posts below"
                : "Discover the latest tech insights from our community"}
            </p>
          </div>
          <div className="flex gap-2 mt-4 md:mt-0">
            <button
              onClick={() => setViewMyPosts(false)}
              className={`px-4 py-2 rounded-lg text-sm font-medium border ${
                !viewMyPosts
                  ? "bg-blue-600 text-white"
                  : "bg-white text-gray-700"
              }`}
            >
              All Posts
            </button>
            <button
              onClick={() => setViewMyPosts(true)}
              className={`px-4 py-2 rounded-lg text-sm font-medium border ${
                viewMyPosts
                  ? "bg-blue-600 text-white"
                  : "bg-white text-gray-700"
              }`}
            >
              My Posts
            </button>
          </div>
        </div>

        {/* Search and Filter Controls */}
        <div className="mb-8 bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
            {/* Search */}
            <form
              onSubmit={handleSearchSubmit}
              className="relative flex-1 max-w-md"
            >
              <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <input
                type="text"
                placeholder={
                  viewMyPosts ? "Search your posts..." : "Search posts..."
                }
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
              {searchTerm !== debouncedSearchTerm && (
                <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600"></div>
                </div>
              )}
            </form>

            {/* Sort Options */}
            <div className="flex items-center space-x-2">
              <span className="text-sm font-medium text-gray-700">
                Sort by:
              </span>
              <div className="flex rounded-lg border border-gray-300 overflow-hidden">
                <button
                  type="button"
                  onClick={() => handleSortChange("popular")}
                  className={`flex items-center space-x-2 px-4 py-2 text-sm font-medium transition-colors ${
                    sortBy === "popular"
                      ? "bg-blue-600 text-white"
                      : "bg-white text-gray-700 hover:bg-gray-50"
                  }`}
                >
                  <TrophyIcon className="h-4 w-4" />
                  <span>Popular</span>
                </button>
                <button
                  type="button"
                  onClick={() => handleSortChange("latest")}
                  className={`flex items-center space-x-2 px-4 py-2 text-sm font-medium transition-colors border-l border-gray-300 ${
                    sortBy === "latest"
                      ? "bg-blue-600 text-white"
                      : "bg-white text-gray-700 hover:bg-gray-50"
                  }`}
                >
                  <ClockIcon className="h-4 w-4" />
                  <span>Latest</span>
                </button>
                <button
                  type="button"
                  onClick={() => handleSortChange("oldest")}
                  className={`flex items-center space-x-2 px-4 py-2 text-sm font-medium transition-colors border-l border-gray-300 ${
                    sortBy === "oldest"
                      ? "bg-blue-600 text-white"
                      : "bg-white text-gray-700 hover:bg-gray-50"
                  }`}
                >
                  <ClockIcon className="h-4 w-4" />
                  <span>Oldest</span>
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <div className="flex items-center">
              <div className="p-2 bg-blue-100 rounded-lg">
                <FireIcon className="h-6 w-6 text-blue-600" />
              </div>
              <div className="ml-4">
                <p className="text-2xl font-semibold text-gray-900">
                  {stats.totalPosts}
                </p>
                <p className="text-sm text-gray-600">
                  {viewMyPosts ? "My Posts" : "Total Posts"}
                </p>
              </div>
            </div>
          </div>
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <div className="flex items-center">
              <div className="p-2 bg-green-100 rounded-lg">
                <TrophyIcon className="h-6 w-6 text-green-600" />
              </div>
              <div className="ml-4">
                <p className="text-2xl font-semibold text-gray-900">
                  {stats.totalUpvotes}
                </p>
                <p className="text-sm text-gray-600">Total Upvotes</p>
              </div>
            </div>
          </div>
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <div className="flex items-center">
              <div className="p-2 bg-purple-100 rounded-lg">
                <ClockIcon className="h-6 w-6 text-purple-600" />
              </div>
              <div className="ml-4">
                <p className="text-2xl font-semibold text-gray-900">
                  {stats.totalReadTime}
                </p>
                <p className="text-sm text-gray-600">Minutes of Content</p>
              </div>
            </div>
          </div>
        </div>

        {/* Posts Section */}
        <div className="space-y-6">
          <h2 className="text-2xl font-bold text-gray-900 flex items-center space-x-2">
            <span>
              {viewMyPosts
                ? "My Posts"
                : sortBy === "popular"
                ? "🏆 Popular Posts"
                : sortBy === "latest"
                ? "🕒 Latest Posts"
                : "📜 Oldest Posts"}
            </span>
            {debouncedSearchTerm && (
              <span className="text-base font-normal text-gray-600">
                ({postsQuery.posts.length} results for "{debouncedSearchTerm}")
              </span>
            )}
          </h2>

          {/* Loading State */}
          {postsQuery.loading && postsQuery.posts.length === 0 && (
            <div className="text-center py-12">
              <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-blue-600 mx-auto"></div>
              <p className="mt-4 text-gray-600">Loading posts...</p>
            </div>
          )}

          {/* No Posts State */}
          {!postsQuery.loading && postsQuery.posts.length === 0 && (
            <div className="text-center py-12">
              <p className="text-gray-500 text-lg">
                {debouncedSearchTerm
                  ? "No posts found matching your search."
                  : viewMyPosts
                  ? "You haven't written any posts yet."
                  : "No posts available yet."}
              </p>
              {!debouncedSearchTerm && !viewMyPosts && (
                <button
                  onClick={() => (window.location.href = "/write")}
                  className="mt-4 bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors"
                >
                  Write the first post!
                </button>
              )}
            </div>
          )}

          {/* Posts Grid */}
          {postsQuery.posts.length > 0 && (
            <>
              <div className="grid gap-6">
                {postsQuery.posts.map((post) => (
                  <PostCard key={post._id} post={post} />
                ))}
              </div>
              {/* Load More Button */}
              {postsQuery.canLoadMore && (
                <div className="text-center pt-8">
                  <button
                    onClick={postsQuery.loadMore}
                    disabled={postsQuery.loading}
                    className="bg-blue-600 text-white px-8 py-3 rounded-lg hover:bg-blue-700 disabled:bg-blue-400 disabled:cursor-not-allowed transition-colors font-medium flex items-center justify-center mx-auto"
                  >
                    {postsQuery.loading ? (
                      <>
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                        Loading...
                      </>
                    ) : (
                      "Load More Posts"
                    )}
                  </button>
                </div>
              )}
              {/* Pagination Info */}
              {postsQuery.pagination && (
                <div className="text-center text-sm text-gray-600 pt-4">
                  Showing {postsQuery.posts.length} of{" "}
                  {postsQuery.pagination.totalPosts} posts
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
