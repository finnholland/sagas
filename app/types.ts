export interface PreBlog {
  title: string,
  body: string,
  userId: string,
  author: string,
  tags: string[],
  saga: string
}
export interface Blog {
  id: string
  createdAt: string
  title: string,
  body: string,
  userId: string,
  visible: boolean,
  tags: string[],
  saga: string
}
export interface User {
  location: string,
  bio: string
  createdAt: string,
  id: string,
  name: string,
  sagas: Saga[],
  tags: string[],
  type: string
}

export interface Saga {
  saga: string,
  updated: string
}