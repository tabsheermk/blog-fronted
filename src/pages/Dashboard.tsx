import React, { useState, useMemo } from "react";
import Navbar from "../components/layout/Navbar";
import PostCard from "../components/ui/PostCard";
import { usePosts } from "../hooks/usePosts";
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

  // Fetch posts with current filters
  const { posts, loading, error, pagination, refetch, loadMore, canLoadMore } =
    usePosts({
      sort: sortBy,
      search: searchTerm || undefined,
      limit: 10,
    });

  // Stats calculations
  const stats = useMemo(() => {
    const totalUpvotes = posts.reduce(
      (sum, post) => sum + post.votes.upvotes,
      0
    );
    const totalReadTime = posts.reduce((sum, post) => sum + post.readTime, 0);

    return {
      totalPosts: pagination?.totalPosts || 0,
      totalUpvotes,
      totalReadTime,
    };
  }, [posts, pagination]);

  const handleSortChange = (newSort: "popular" | "latest" | "oldest") => {
    setSortBy(newSort);
  };

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // The search will trigger automatically via the usePosts hook
  };

  if (error && !posts.length) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Navbar />
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="text-center py-12">
            <ExclamationTriangleIcon className="h-12 w-12 text-red-500 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              Failed to load posts
            </h3>
            <p className="text-gray-600 mb-4">{error}</p>
            <button
              onClick={refetch}
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
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Welcome back! 👋
          </h1>
          <p className="text-lg text-gray-600">
            Discover the latest tech insights from our community
          </p>
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
                placeholder="Search posts..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </form>

            {/* Sort Options */}
            <div className="flex items-center space-x-2">
              <span className="text-sm font-medium text-gray-700">
                Sort by:
              </span>
              <div className="flex rounded-lg border border-gray-300 overflow-hidden">
                <button
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
                <p className="text-sm text-gray-600">Total Posts</p>
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
              {sortBy === "popular" && "🏆 Popular Posts"}
              {sortBy === "latest" && "🕒 Latest Posts"}
              {sortBy === "oldest" && "📜 Oldest Posts"}
            </span>
            {searchTerm && (
              <span className="text-base font-normal text-gray-600">
                ({posts.length} results for "{searchTerm}")
              </span>
            )}
          </h2>

          {/* Loading State */}
          {loading && posts.length === 0 && (
            <div className="text-center py-12">
              <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-blue-600 mx-auto"></div>
              <p className="mt-4 text-gray-600">Loading posts...</p>
            </div>
          )}

          {/* No Posts State */}
          {!loading && posts.length === 0 && (
            <div className="text-center py-12">
              <p className="text-gray-500 text-lg">
                {searchTerm
                  ? "No posts found matching your search."
                  : "No posts available yet."}
              </p>
              {!searchTerm && (
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
          {posts.length > 0 && (
            <>
              <div className="grid gap-6">
                {posts.map((post) => (
                  <PostCard key={post._id} post={post} />
                ))}
              </div>

              {/* Load More Button */}
              {canLoadMore && (
                <div className="text-center pt-8">
                  <button
                    onClick={loadMore}
                    disabled={loading}
                    className="bg-blue-600 text-white px-8 py-3 rounded-lg hover:bg-blue-700 disabled:bg-blue-400 disabled:cursor-not-allowed transition-colors font-medium flex items-center justify-center mx-auto"
                  >
                    {loading ? (
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
              {pagination && (
                <div className="text-center text-sm text-gray-600 pt-4">
                  Showing {posts.length} of {pagination.totalPosts} posts
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
