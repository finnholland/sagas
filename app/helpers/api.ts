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

export const saveDraft = async (user: User, body: string, jwt: string) => {
  Axios.post(`${API}/saveDraft`, { ...user, draft: body }, { headers: { Authorization: jwt } })
}

export const getComments = async (blogId: string, setComments: Dispatch<SetStateAction<CommentI[]>>) => { 
  Axios.get(`${API}/getComments`, { params: { blogId: blogId } }).then(res => {
    setComments(res.data.items)
  })
}

export const createComment = async (userId: string, blogId: string, author: string, body: string, image: string) => {
  Axios.post(`${API}/createComment`, { userId: userId, blogId: blogId, author: author, body: censorText(body), image: image })
}

export const likeItem = async (userId: string, id: string, createdAt: string, likes: string[], liked: boolean) => {
  Axios.post(`${API}/likeItem`, { id: id, createdAt: createdAt, likes: likes, userId: userId, like: !liked})
}
