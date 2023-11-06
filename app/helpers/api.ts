import Axios from 'axios';
import { API } from '../constants';
import { updateBlogI } from './interface';
import { BlogI, CommentI, PreBlog, User } from '../types';
import { Dispatch, SetStateAction } from 'react';
import { censorText } from './helpers';

export const updateBlog = (props: updateBlogI) => {
  if (props.originalBlog !== undefined && props.originalBlog) {
    props.setIsOpen(false)
    const params = {
      body: props.preBlog.body === props.originalBlog?.body ? null : props.preBlog.body,
      title: props.preBlog.title === props.originalBlog?.title ? null : props.preBlog.title,
      id: props.originalBlog?.id,
      createdAt: props.originalBlog?.createdAt
    }

    Axios.post(`${API}/updateBlog`, params, { headers: { Authorization: props.user.jwt } }).then(res => {
      props.setPreBlog({ title: '', body: '', userId: props.user.id || '', author: props.user.name || '', tags: [], saga: '' });
      props.setCreatingBlog(false);
      props.setOriginalBlog(undefined);
    })
  }
}

export const deleteOrHideBlog = async (deleteBlog: boolean, hideBlog: boolean, id: string, createdAt: string, jwt: string | undefined) => {
  if (deleteBlog) {
    Axios.post(`${API}/updateBlog`, { delete: true, id: id, createdAt: createdAt }, { headers: { Authorization: jwt } })
  } else {
    Axios.post(`${API}/updateBlog`, { hide: !hideBlog, id: id, createdAt: createdAt }, { headers: { Authorization: jwt } })
  }
}

export const saveDraft = async (user: User, body: string) => {
  Axios.post(`${API}/saveDraft`, { ...user, draft: body })
}

export const getComments = async (blogId: string, setComments: Dispatch<SetStateAction<CommentI[]>>) => { 
  // Axios.get(`${API}/getComments`, { params: { blogId: blogId } })
  const tempComments: CommentI[] = []
  for (let i = 0; i < Math.floor(Math.random() * ((10))); i++) {
    tempComments.push({
      id: i.toString(),
      author: 'john_johnson',
      body: 'blogus commentus',
      image: 'koala.png', createdAt: '2023-11-06T05:43:44+00:00', likes: []
    })
  }
  return setComments(tempComments)
}

export const createComment = async (userId: string, blogId: string, author: string, body: string, image: string) => {
  Axios.post(`${API}/createComment`, { userId: userId, blogId: blogId, author: author, body: censorText(body), image: image })
}

export const likeBlog = async (blogId: string, userId: string, setBlog: Dispatch<SetStateAction<BlogI>>, blog: BlogI) => {
  // Axios.post(`${API}/likeBlog`, { blogId, userId })
  if (!blog.likes) {
    setBlog(prev => ({ ...prev, likes: [userId] }))
  } else if (blog.likes.includes(userId)) {
    // Axios.post(`${API}/likeBlog`, { blogId, userId, false })
    setBlog(prev => ({ ...prev, likes: blog.likes.filter(u => u != userId) }))
  } else {
    // Axios.post(`${API}/likeBlog`, { blogId, userId, true })
    let tempLikes = blog.likes
    tempLikes.push(userId)
    setBlog(prev => ({ ...prev, likes: tempLikes }))
  }
}

export const likeComment = async (userId: string, comment: CommentI, liked: boolean) => {
  comment.id = 'comment-128264c0-1cf0-4be9-8112-8797bab15f4a-2023-11-06T05:43:44+00:00'
  Axios.post(`${API}/likeComment`, { comment: comment, userId: userId, like: !liked})
}
