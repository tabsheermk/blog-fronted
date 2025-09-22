import React from "react";

const Home: React.FC = () => {
  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
      <div className="max-w-lg text-center">
        <h1 className="text-4xl font-bold text-gray-900 mb-4 sm:text-5xl">
          Welcome to DevBlog
        </h1>
        <p className="text-xl text-gray-600 mb-8 sm:text-2xl">
          I hope you have a good time!
        </p>
        <div className="flex flex-col sm:flex-row justify-center gap-4">
          <a
            href="/login"
            className="w-full sm:w-auto bg-blue-600 text-white px-6 py-3 rounded-lg font-medium hover:bg-blue-700 transition-colors"
          >
            Sign In
          </a>
          <a
            href="/register"
            className="w-full sm:w-auto border border-gray-300 text-gray-700 px-6 py-3 rounded-lg font-medium hover:bg-gray-50 transition-colors"
          >
            Sign Up
          </a>
        </div>
      </div>
    </div>
  );
};

export default Home;
