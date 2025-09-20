// User related types
export interface User {
  id: string;
  firstName: string;
  lastName: string;
  fullName: string;
  email: string;
  avatar?: string;
  bio?: string;
  role: "user" | "admin";
  isVerified: boolean;
  lastLogin?: string;
  createdAt: string;
  updatedAt?: string;
}

// Post related types
export interface Post {
  _id: string;
  title: string;
  content: string;
  tags: string[];
  author: string;
  authorDetails: {
    _id: string;
    firstName: string;
    lastName: string;
    email: string;
    avatar?: string;
  };
  votes: {
    upvotes: number;
    downvotes: number;
    score: number;
  };
  readTime: number;
  isPublished: boolean;
  slug: string;
  views: number;
  commentCount: number;
  createdAt: string;
  updatedAt: string;
}

// Comment related types
export interface Comment {
  _id: string;
  content: string;
  author: string;
  authorDetails: {
    _id: string;
    firstName: string;
    lastName: string;
    avatar?: string;
  };
  post: string;
  parentComment?: string;
  depth: number;
  votes: {
    upvotes: number;
    downvotes: number;
    score: number;
  };
  isEdited: boolean;
  editedAt?: string;
  isDeleted: boolean;
  replyCount: number;
  replies?: Comment[];
  hasMoreReplies?: boolean;
  createdAt: string;
  updatedAt: string;
}

// API Response types
export interface ApiResponse<T = unknown> {
  success: boolean;
  message: string;
  data?: T;
  errors?: ValidationError[];
}

export interface ValidationError {
  field: string;
  message: string;
}

export interface PaginationInfo {
  currentPage: number;
  totalPages: number;
  totalItems: number;
  hasNextPage: boolean;
  hasPrevPage: boolean;
}

// Auth related types
export interface LoginCredentials {
  email: string;
  password: string;
}

export interface RegisterData {
  firstName: string;
  lastName: string;
  email: string;
  password: string;
}

export interface AuthResponse {
  success: boolean;
  message: string;
  data: {
    user: User;
    token: string;
  };
}

// Post related API types
export interface PostsResponse {
  success: boolean;
  data: {
    posts: Post[];
    pagination: PaginationInfo;
  };
}

export interface SinglePostResponse {
  success: boolean;
  data: {
    post: Post;
  };
}

export interface CreatePostData {
  title: string;
  content: string;
  tags: string[];
}

export interface UpdatePostData {
  title?: string;
  content?: string;
  tags?: string[];
}

// Comment related API types
export interface CommentsResponse {
  success: boolean;
  data: {
    comments: Comment[];
    pagination: PaginationInfo;
  };
}

export interface CreateCommentData {
  content: string;
  parentCommentId?: string;
}

export interface UpdateCommentData {
  content: string;
}

// Vote related types
export interface VoteResponse {
  success: boolean;
  data: {
    votes: {
      upvotes: number;
      downvotes: number;
      score: number;
    };
    userVote: "upvote" | "downvote" | null;
  };
}

export type VoteType = "upvote" | "downvote";

// Filter and search types
export interface PostFilters {
  page?: number;
  limit?: number;
  sort?: "latest" | "popular" | "oldest";
  tag?: string;
  search?: string;
  author?: string;
}

export interface CommentFilters {
  page?: number;
  limit?: number;
  sort?: "newest" | "oldest" | "popular";
}

// UI Component types
export interface LoadingState {
  isLoading: boolean;
  error?: string | null;
}

export interface FormState<T> extends LoadingState {
  data: T;
}

// Route types
export interface RouteParams {
  slug?: string;
  id?: string;
  commentId?: string;
}

// Theme and UI types
export type ButtonVariant = "primary" | "secondary" | "danger" | "outline";
export type ButtonSize = "sm" | "md" | "lg";

export interface ButtonProps {
  variant?: ButtonVariant;
  size?: ButtonSize;
  disabled?: boolean;
  loading?: boolean;
  fullWidth?: boolean;
  children: React.ReactNode;
  onClick?: () => void;
  type?: "button" | "submit" | "reset";
  className?: string;
}

// Form types
export interface FormFieldError {
  message?: string;
}

export interface LoginFormData {
  email: string;
  password: string;
}

export interface RegisterFormData {
  firstName: string;
  lastName: string;
  email: string;
  password: string;
  confirmPassword: string;
}

export interface PostFormData {
  title: string;
  content: string;
  tags: string;
  isPublished: boolean;
}

export interface CommentFormData {
  content: string;
}

export interface ProfileFormData {
  firstName: string;
  lastName: string;
  bio: string;
}

// Utility types
export type Optional<T, K extends keyof T> = Omit<T, K> & Partial<Pick<T, K>>;
export type RequiredKeys<T, K extends keyof T> = T & Required<Pick<T, K>>;

// Context types
export interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (data: RegisterData) => Promise<void>;
  logout: () => Promise<void>;
  refreshUser: () => Promise<void>;
}

// Hook return types
export interface UsePostsReturn extends LoadingState {
  posts: Post[];
  pagination: PaginationInfo | null;
  filters: PostFilters;
  setFilters: (filters: Partial<PostFilters>) => void;
  refetch: () => Promise<void>;
}

export interface UsePostReturn extends LoadingState {
  post: Post | null;
  refetch: () => Promise<void>;
}

export interface UseCommentsReturn extends LoadingState {
  comments: Comment[];
  pagination: PaginationInfo | null;
  addComment: (data: CreateCommentData) => Promise<void>;
  updateComment: (id: string, data: UpdateCommentData) => Promise<void>;
  deleteComment: (id: string) => Promise<void>;
  voteComment: (id: string, voteType: VoteType) => Promise<void>;
  refetch: () => Promise<void>;
}

// Constants
export const POST_SORT_OPTIONS = [
  { value: "latest", label: "Latest" },
  { value: "popular", label: "Popular" },
  { value: "oldest", label: "Oldest" },
] as const;

export const COMMENT_SORT_OPTIONS = [
  { value: "newest", label: "Newest" },
  { value: "oldest", label: "Oldest" },
  { value: "popular", label: "Popular" },
] as const;

export const USER_ROLES = ["user", "admin"] as const;

// Error types
export interface ApiError {
  message: string;
  code?: string;
  status?: number;
  details?: unknown;
}

export class AppError extends Error {
  public code?: string;
  public status?: number;
  public details?: unknown;

  constructor(
    message: string,
    code?: string,
    status?: number,
    details?: unknown
  ) {
    super(message);
    this.name = "AppError";
    this.code = code;
    this.status = status;
    this.details = details;
  }
}

// Utility type guards
export const isApiError = (error: unknown): error is ApiError => {
  const err = error as ApiError;
  return err && typeof err === "object" && "message" in err;
};

export const isValidationError = (
  error: unknown
): error is { errors: ValidationError[] } => {
  const err = error as { errors: ValidationError[] };
  return (
    err &&
    typeof err === "object" &&
    "errors" in err &&
    Array.isArray(err.errors)
  );
};

// Export all types for easy importing
export type {
  // Re-export commonly used types for convenience
  User as IUser,
  Post as IPost,
  Comment as IComment,
  ApiResponse as IApiResponse,
  AuthContextType as IAuthContext,
};
