import { Dispatch, SetStateAction } from "react";
import { BlogI, PreBlog, User } from "../types";

export interface editBlogI {
  currentUser: User
  preBlog: PreBlog
  setPreBlog: Dispatch<SetStateAction<PreBlog>>
  blog: BlogI
  creatingBlog: boolean
  setCreatingBlog: Dispatch<SetStateAction<boolean>>
  jwt: string
}
export interface updateBlogI { 
  setIsOpen: Dispatch<SetStateAction<boolean>>
  preBlog: PreBlog
  setPreBlog: Dispatch<SetStateAction<PreBlog>>
  originalBlog: BlogI | undefined
  setOriginalBlog: Dispatch<SetStateAction<BlogI | undefined>>
  setCreatingBlog: Dispatch<SetStateAction<boolean>>
  user: User
}