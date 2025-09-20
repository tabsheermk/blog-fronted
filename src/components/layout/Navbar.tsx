import React from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../../contexts/AuthContext";
import {
  CodeBracketIcon,
  PlusIcon,
  ArrowRightOnRectangleIcon,
  Bars3Icon,
  XMarkIcon,
} from "@heroicons/react/24/outline";
import { showSuccess } from "../../utils/toast";

const Navbar: React.FC = () => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = React.useState(false);
  const navigate = useNavigate();
  const { user, logout } = useAuth();

  const handleLogout = async () => {
    try {
      await logout();
      showSuccess("Successfully logged out!");
      navigate("/login");
    } catch (error) {
      console.error("Logout failed:", error);
    }
  };

  const userName = user ? `${user.firstName} ${user.lastName}` : "User";

  return (
    <nav className="bg-white shadow-sm border-b border-gray-200 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <Link to="/dashboard" className="flex items-center space-x-2">
            <div className="bg-blue-600 p-2 rounded-lg">
              <CodeBracketIcon className="h-6 w-6 text-white" />
            </div>
            <span className="text-xl font-bold text-gray-900">DevBlog</span>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-6">
            <Link
              to="/write"
              className="flex items-center space-x-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors font-medium"
            >
              <PlusIcon className="h-4 w-4" />
              <span>Write</span>
            </Link>

            {/* User Menu */}
            <div className="flex items-center space-x-4">
              <span className="text-gray-700 font-medium">
                Hello, {user?.firstName || "User"}
              </span>
              <button
                onClick={handleLogout}
                className="flex items-center space-x-2 text-gray-600 hover:text-red-600 transition-colors"
              >
                <ArrowRightOnRectangleIcon className="h-5 w-5" />
                <span>Logout</span>
              </button>
            </div>
          </div>

          {/* Mobile menu button */}
          <div className="md:hidden">
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="text-gray-600 hover:text-blue-600 p-2"
            >
              {isMobileMenuOpen ? (
                <XMarkIcon className="h-6 w-6" />
              ) : (
                <Bars3Icon className="h-6 w-6" />
              )}
            </button>
          </div>
        </div>

        {/* Mobile Navigation */}
        {isMobileMenuOpen && (
          <div className="md:hidden py-4 border-t border-gray-200">
            <div className="space-y-3">
              <Link
                to="/write"
                className="flex items-center space-x-2 text-blue-600 font-medium"
                onClick={() => setIsMobileMenuOpen(false)}
              >
                <PlusIcon className="h-4 w-4" />
                <span>Write Post</span>
              </Link>

              <div className="pt-3 border-t border-gray-200">
                <p className="text-gray-700 font-medium mb-2">
                  Hello, {userName}
                </p>
                <button
                  onClick={() => {
                    setIsMobileMenuOpen(false);
                    handleLogout();
                  }}
                  className="flex items-center space-x-2 text-red-600 font-medium"
                >
                  <ArrowRightOnRectangleIcon className="h-4 w-4" />
                  <span>Logout</span>
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </nav>
  );
};

export default Navbar;
