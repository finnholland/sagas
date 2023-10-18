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
  saga: string
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
  sagas: Saga[],
  tags: string[],
  type: string
  draft?: string
}

export interface Saga {
  saga: string,
  updated: string
}