import { Dispatch, SetStateAction } from "react";
import { Blog, PreBlog, User } from "../types";

export interface editBlogI { 
  setPreBlog: Dispatch<SetStateAction<PreBlog>>
  setCreatingBlog: Dispatch<SetStateAction<boolean>>
  setOriginalBlog: Dispatch<SetStateAction<Blog | undefined>>
  blog: Blog
}
export interface updateBlogI { 
  setIsOpen: Dispatch<SetStateAction<boolean>>
  preBlog: PreBlog
  setPreBlog: Dispatch<SetStateAction<PreBlog>>
  originalBlog: Blog | undefined
  setOriginalBlog: Dispatch<SetStateAction<Blog | undefined>>
  setCreatingBlog: Dispatch<SetStateAction<boolean>>
  user: User
}