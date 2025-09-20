import React, { useState } from "react";
import Navbar from "../components/layout/Navbar";
import PostCard from "../components/ui/PostCard";
import { mockPosts } from "../utils/mockData";
import {
  FireIcon,
  ClockIcon,
  TrophyIcon,
  MagnifyingGlassIcon,
} from "@heroicons/react/24/outline";

const Dashboard: React.FC = () => {
  const [sortBy, setSortBy] = useState<"popular" | "latest" | "trending">(
    "popular"
  );
  const [searchTerm, setSearchTerm] = useState("");

  // Sort posts based on selected criteria
  const sortedPosts = [...mockPosts].sort((a, b) => {
    switch (sortBy) {
      case "popular":
        return b.votes.score - a.votes.score;
      case "latest":
        return (
          new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
        );
      case "trending": // Simple trending algorithm based on recent votes and views
      {
        const trendScoreA = a.votes.score + a.views / 10;
        const trendScoreB = b.votes.score + b.views / 10;
        return trendScoreB - trendScoreA;
      }
      default:
        return 0;
    }
  });

  // Filter posts based on search term
  const filteredPosts = sortedPosts.filter(
    (post) =>
      post.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      post.content.toLowerCase().includes(searchTerm.toLowerCase()) ||
      post.tags.some((tag) =>
        tag.toLowerCase().includes(searchTerm.toLowerCase())
      )
  );

  const handleLogout = () => {
    // For now, just console.log - we'll implement proper logout later
    console.log("Logging out...");
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar userName="John Doe" onLogout={handleLogout} />

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
            <div className="relative flex-1 max-w-md">
              <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <input
                type="text"
                placeholder="Search posts..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>

            {/* Sort Options */}
            <div className="flex items-center space-x-2">
              <span className="text-sm font-medium text-gray-700">
                Sort by:
              </span>
              <div className="flex rounded-lg border border-gray-300 overflow-hidden">
                <button
                  onClick={() => setSortBy("popular")}
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
                  onClick={() => setSortBy("latest")}
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
                  onClick={() => setSortBy("trending")}
                  className={`flex items-center space-x-2 px-4 py-2 text-sm font-medium transition-colors border-l border-gray-300 ${
                    sortBy === "trending"
                      ? "bg-blue-600 text-white"
                      : "bg-white text-gray-700 hover:bg-gray-50"
                  }`}
                >
                  <FireIcon className="h-4 w-4" />
                  <span>Trending</span>
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
                  {mockPosts.length}
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
                  {mockPosts.reduce((sum, post) => sum + post.votes.upvotes, 0)}
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
                  {mockPosts.reduce((sum, post) => sum + post.readTime, 0)}
                </p>
                <p className="text-sm text-gray-600">Minutes of Content</p>
              </div>
            </div>
          </div>
        </div>

        {/* Posts Grid */}
        <div className="space-y-6">
          <h2 className="text-2xl font-bold text-gray-900 flex items-center space-x-2">
            <span>
              {sortBy === "popular" && "🏆 Popular Posts"}
              {sortBy === "latest" && "🕒 Latest Posts"}
              {sortBy === "trending" && "🔥 Trending Posts"}
            </span>
            {searchTerm && (
              <span className="text-base font-normal text-gray-600">
                ({filteredPosts.length} results for "{searchTerm}")
              </span>
            )}
          </h2>

          {filteredPosts.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-gray-500 text-lg">
                {searchTerm
                  ? "No posts found matching your search."
                  : "No posts available."}
              </p>
            </div>
          ) : (
            <div className="grid gap-6">
              {filteredPosts.map((post) => (
                <PostCard key={post._id} post={post} />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
