export interface PreBlog {
  title: string,
  body: string,
  userId: string,
  author: string,
  tags: string[],
  saga: string
}
export interface BlogI {
  editedAt: string
  id: string
  createdAt: string
  title: string,
  body: string,
  userId: string,
  author: string,
  visible: boolean,
  tags: string[],
  saga: string,
  likes: string[]
}
export interface FilterBlog {
  id?: string
  createdAt?: string
  title?: string,
  body?: string,
  userId?: string,
  author?: string,
  visible?: boolean,
  tags?: string[],
  saga?: string
}
export interface User {
  location: string,
  bio: string
  createdAt: string,
  id: string,
  profileImage: string,
  name: string,
  sagas: SagaI[],
  tags: string[],
  type: string
  draft?: string
  jwt?: string
}

export interface SagaI {
  saga: string,
  updated: string
}
export interface CommentI {
  id: string
  author: string
  body: string
  image: string
  createdAt: string
  likes: string[]
}