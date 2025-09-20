import type { Post } from "../types/index.ts";

export const mockPosts: Post[] = [
  {
    _id: "1",
    title: "Getting Started with React 19 and Server Components",
    content:
      "React 19 introduces powerful new features including Server Components that revolutionize how we build React applications. In this comprehensive guide, we'll explore the key concepts and practical implementation...",
    tags: ["react", "javascript", "web-development", "server-components"],
    author: "60d5ecb54b24a12b8c5c9e5f",
    authorDetails: {
      firstName: "Sarah",
      lastName: "Johnson",
      email: "sarah@example.com",
    },
    votes: {
      upvotes: 125,
      downvotes: 8,
      score: 117,
    },
    slug: "getting-started-react-19-server-components",
    views: 1250,
    commentCount: 23,
    readTime: 8,
    createdAt: "2025-09-18T10:30:00Z",
    updatedAt: "2025-09-18T10:30:00Z",
  },
  {
    _id: "2",
    title: "Building Scalable APIs with Node.js and TypeScript",
    content:
      "Learn how to build production-ready APIs that can handle millions of requests. We'll cover architecture patterns, error handling, testing strategies, and deployment best practices...",
    tags: ["nodejs", "typescript", "api", "backend", "scalability"],
    author: "60d5ecb54b24a12b8c5c9e60",
    authorDetails: {
      firstName: "Michael",
      lastName: "Chen",
      email: "michael@example.com",
    },
    votes: {
      upvotes: 89,
      downvotes: 5,
      score: 84,
    },
    slug: "building-scalable-apis-nodejs-typescript",
    views: 980,
    commentCount: 18,
    readTime: 12,
    createdAt: "2025-09-19T14:15:00Z",
    updatedAt: "2025-09-19T14:15:00Z",
  },
  {
    _id: "3",
    title: "The Future of Web Development: WebAssembly and Beyond",
    content:
      "WebAssembly is changing the landscape of web development. Discover how WASM enables near-native performance in the browser and opens up new possibilities for web applications...",
    tags: ["webassembly", "performance", "web-development", "future-tech"],
    author: "60d5ecb54b24a12b8c5c9e61",
    authorDetails: {
      firstName: "Emma",
      lastName: "Rodriguez",
      email: "emma@example.com",
    },
    votes: {
      upvotes: 76,
      downvotes: 3,
      score: 73,
    },
    slug: "future-web-development-webassembly",
    views: 720,
    commentCount: 15,
    readTime: 6,
    createdAt: "2025-09-20T09:45:00Z",
    updatedAt: "2025-09-20T09:45:00Z",
  },
  {
    _id: "4",
    title: "Mastering CSS Grid and Flexbox: A Complete Guide",
    content:
      "CSS Grid and Flexbox are powerful layout systems that have revolutionized how we approach responsive design. This guide covers everything from basic concepts to advanced techniques...",
    tags: ["css", "grid", "flexbox", "responsive-design", "frontend"],
    author: "60d5ecb54b24a12b8c5c9e62",
    authorDetails: {
      firstName: "David",
      lastName: "Kim",
      email: "david@example.com",
    },
    votes: {
      upvotes: 92,
      downvotes: 4,
      score: 88,
    },
    slug: "mastering-css-grid-flexbox-guide",
    views: 1100,
    commentCount: 21,
    readTime: 10,
    createdAt: "2025-09-17T16:20:00Z",
    updatedAt: "2025-09-17T16:20:00Z",
  },
  {
    _id: "5",
    title: "DevOps Best Practices: Docker, Kubernetes, and CI/CD",
    content:
      "Modern software development requires robust DevOps practices. Learn how to containerize applications with Docker, orchestrate with Kubernetes, and set up efficient CI/CD pipelines...",
    tags: ["devops", "docker", "kubernetes", "cicd", "deployment"],
    author: "60d5ecb54b24a12b8c5c9e63",
    authorDetails: {
      firstName: "Lisa",
      lastName: "Wang",
      email: "lisa@example.com",
    },
    votes: {
      upvotes: 67,
      downvotes: 2,
      score: 65,
    },
    slug: "devops-best-practices-docker-kubernetes",
    views: 850,
    commentCount: 14,
    readTime: 15,
    createdAt: "2025-09-16T11:30:00Z",
    updatedAt: "2025-09-16T11:30:00Z",
  },
];
