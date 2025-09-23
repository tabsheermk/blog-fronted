import React, { useState, useEffect, useMemo } from "react";
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
  useEffect(() => {
    const timer = setTimeout(() => setDebouncedSearchTerm(searchTerm), 500);
    return () => clearTimeout(timer);
  }, [searchTerm]);

  // Memoize options for posts
  const postsOptions = useMemo(
    () => ({
      sort: sortBy,
      search: debouncedSearchTerm || undefined,
      limit: 10,
      author: viewMyPosts && user ? user.id : undefined,
    }),
    [sortBy, debouncedSearchTerm, viewMyPosts, user]
  );

  const postsQuery = usePosts(postsOptions);

  // Calculate stats
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

  const handleSortChange = (newSort: "popular" | "latest" | "oldest") =>
    setSortBy(newSort);

  const handleSearchSubmit = (e: React.FormEvent) => e.preventDefault();

  if (postsQuery.error && postsQuery.posts.length === 0) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Navbar />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
          <div className="text-center">
            <ExclamationTriangleIcon className="mx-auto mb-4 h-12 w-12 text-red-500" />
            <h3 className="mb-2 text-lg font-semibold text-gray-900">
              Failed to load posts
            </h3>
            <p className="mb-4 text-gray-600">{postsQuery.error}</p>
            <button
              onClick={postsQuery.refetch}
              className="inline-block rounded border border-blue-600 bg-blue-600 px-6 py-2 font-medium text-white transition hover:bg-blue-700"
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

      <main className="max-w-full sm:max-w-7xl mx-auto p-0 sm:px-6 lg:px-8 py-10">
        {/* Header with welcome and toggle buttons */}
        <div className="mb-8 flex flex-col md:flex-row md:items-end md:justify-between gap-4">
          <div className="text-center md:text-left flex-1">
            <h1 className="text-3xl font-bold text-gray-900 mb-1">
              Welcome back! 👋
            </h1>
            <p className="text-lg text-gray-600 max-w-md mx-auto md:max-w-none">
              {viewMyPosts
                ? "Review your own posts below"
                : "Discover the latest insights from the community"}
            </p>
          </div>

          <div className="flex justify-center md:justify-start gap-2">
            <button
              className={`rounded border px-4 py-2 font-medium text-sm transition ${
                !viewMyPosts
                  ? "bg-blue-600 text-white border-blue-600"
                  : "bg-white text-gray-700 border-gray-300 hover:bg-gray-50"
              }`}
              onClick={() => setViewMyPosts(false)}
            >
              All Posts
            </button>
            <button
              className={`rounded border px-4 py-2 font-medium text-sm transition ${
                viewMyPosts
                  ? "bg-blue-600 text-white border-blue-600"
                  : "bg-white text-gray-700 border-gray-300 hover:bg-gray-50"
              }`}
              onClick={() => setViewMyPosts(true)}
            >
              My Posts
            </button>
          </div>
        </div>

        {/* Search & Filter */}
        <section className="mb-8 bg-white rounded-lg border border-gray-200 p-6 shadow-sm">
          <form
            onSubmit={handleSearchSubmit}
            className="mb-4 flex flex-col sm:flex-row sm:items-center sm:gap-4"
          >
            <div className="relative w-full sm:max-w-md">
              <MagnifyingGlassIcon className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-gray-400" />
              <input
                type="search"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder={
                  viewMyPosts ? "Search your posts..." : "Search posts..."
                }
                className="w-full rounded border border-gray-300 py-2 pl-10 pr-4 text-sm focus:border-blue-500 focus:ring-2 focus:ring-blue-500"
              />
              {searchTerm !== debouncedSearchTerm && (
                <div className="absolute right-3 top-1/2 -translate-y-1/2">
                  <div className="h-4 w-4 animate-spin rounded-full border-b-2 border-blue-600"></div>
                </div>
              )}
            </div>
            <div className="flex items-center gap-2 mt-[3]">
              <span className="text-sm text-gray-700 whitespace-nowrap">
                Sort by:
              </span>
              <div className="inline-flex rounded border border-gray-300 overflow-hidden">
                {["popular", "latest", "oldest"].map((option) => {
                  const isSelected = sortBy === option;
                  const Icon = option === "popular" ? TrophyIcon : ClockIcon;
                  return (
                    <button
                      key={option}
                      type="button"
                      className={`flex items-center gap-1 px-4 py-2 text-sm font-medium transition ${
                        isSelected
                          ? "bg-blue-600 text-white"
                          : "bg-white text-gray-700 hover:bg-gray-50"
                      } border-l border-gray-300 first:border-l-0`}
                      onClick={() =>
                        handleSortChange(
                          option as "popular" | "latest" | "oldest"
                        )
                      }
                    >
                      <Icon className="h-4 w-4" />
                      <span className="capitalize">{option}</span>
                    </button>
                  );
                })}
              </div>
            </div>
          </form>

          {/* Stats */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            <div className="flex items-center gap-4 rounded border border-gray-200 bg-white p-4 shadow-sm">
              <div className="rounded bg-blue-100 p-2">
                <FireIcon className="h-6 w-6 text-blue-600" />
              </div>
              <div>
                <div className="text-2xl font-semibold text-gray-900">
                  {stats.totalPosts}
                </div>
                <div className="text-sm text-gray-600">
                  {viewMyPosts ? "Your Posts" : "Total Posts"}
                </div>
              </div>
            </div>
            <div className="flex items-center gap-4 rounded border border-gray-200 bg-white p-4 shadow-sm">
              <div className="rounded bg-green-100 p-2">
                <TrophyIcon className="h-6 w-6 text-green-600" />
              </div>
              <div>
                <div className="text-2xl font-semibold text-gray-900">
                  {stats.totalUpvotes}
                </div>
                <div className="text-sm text-gray-600">Total Upvotes</div>
              </div>
            </div>
            <div className="flex items-center gap-4 rounded border border-gray-200 bg-white p-4 shadow-sm">
              <div className="rounded bg-purple-100 p-2">
                <ClockIcon className="h-6 w-6 text-purple-600" />
              </div>
              <div>
                <div className="text-2xl font-semibold text-gray-900">
                  {stats.totalReadTime}
                </div>
                <div className="text-sm text-gray-600">Minutes Read</div>
              </div>
            </div>
          </div>
        </section>

        {/* Posts Section */}
        <section>
          <h2 className="mb-6 flex items-center gap-2 text-2xl font-bold text-gray-900">
            {viewMyPosts
              ? "Your Posts"
              : sortBy === "popular"
              ? "🏆 Popular Posts"
              : sortBy === "latest"
              ? "🕒 Latest Posts"
              : "📜 Oldest Posts"}
            {debouncedSearchTerm && (
              <span className="ml-2 text-base font-normal text-gray-600">
                ({postsQuery.posts.length} results)
              </span>
            )}
          </h2>

          {postsQuery.loading && postsQuery.posts.length === 0 ? (
            <div className="py-16 text-center">
              <div className="mx-auto mb-4 h-16 w-16 animate-spin rounded-full border-b-2 border-blue-600"></div>
              <p className="text-gray-600">Loading posts...</p>
            </div>
          ) : postsQuery.error && postsQuery.posts.length === 0 ? (
            <div className="py-16 text-center">
              <ExclamationTriangleIcon className="mx-auto mb-4 h-12 w-12 text-red-500" />
              <p className="mb-4 text-gray-600">{postsQuery.error}</p>
              <button
                onClick={postsQuery.refetch}
                className="inline-block rounded border border-blue-600 bg-blue-600 px-6 py-2 text-white transition hover:bg-blue-700"
              >
                Try Again
              </button>
            </div>
          ) : postsQuery.posts.length === 0 ? (
            <div className="py-16 text-center">
              <p className="mb-4 text-lg text-gray-600">
                {debouncedSearchTerm
                  ? "No posts found matching your search."
                  : viewMyPosts
                  ? "You haven't written any posts yet."
                  : "No posts available."}
              </p>
              {!debouncedSearchTerm && !viewMyPosts && (
                <button
                  onClick={() => (window.location.href = "/write")}
                  className="inline-block rounded bg-blue-600 px-6 py-2 font-medium text-white transition hover:bg-blue-700"
                >
                  Write the First Post
                </button>
              )}
            </div>
          ) : (
            <>
              <div className="grid gap-6 sm:grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
                {postsQuery.posts.map((post) => (
                  <PostCard key={post._id} post={post} />
                ))}
              </div>

              {postsQuery.canLoadMore && (
                <div className="mt-10 text-center">
                  <button
                    onClick={postsQuery.loadMore}
                    disabled={postsQuery.loading}
                    className="inline-flex items-center gap-2 rounded bg-blue-600 px-8 py-3 font-medium text-white transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:bg-blue-400"
                  >
                    {postsQuery.loading && (
                      <svg
                        className="inline animate-spin"
                        xmlns="http://www.w3.org/2000/svg"
                        fill="none"
                        viewBox="0 0 24 24"
                        width="20"
                        height="20"
                      >
                        <circle
                          className="opacity-25"
                          cx="12"
                          cy="12"
                          r="10"
                          stroke="currentColor"
                          strokeWidth="4"
                        />
                        <path
                          className="opacity-75"
                          fill="currentColor"
                          d="M4 12a8 8 0 018-8v8z"
                        />
                      </svg>
                    )}
                    {postsQuery.loading ? "Loading..." : "Load More Posts"}
                  </button>
                </div>
              )}

              {postsQuery.pagination && (
                <p className="mt-6 text-center text-sm text-gray-600">
                  Showing {postsQuery.posts.length} of{" "}
                  {postsQuery.pagination.totalPosts} posts
                </p>
              )}
            </>
          )}
        </section>
      </main>
    </div>
  );
};

export default Dashboard;
