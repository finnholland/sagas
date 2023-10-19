import Axios from 'axios';
import { API } from '../constants';
import { updateBlogI } from './interface';
import { PreBlog, User } from '../types';
import { Dispatch, SetStateAction } from 'react';

export const updateBlog = (props: updateBlogI) => {
  if (props.originalBlog !== undefined && props.originalBlog) {
    props.setIsOpen(false)
    const params = {
      body: props.preBlog.body === props.originalBlog?.body ? null : props.preBlog.body,
      title: props.preBlog.title === props.originalBlog?.title ? null : props.preBlog.title,
      id: props.originalBlog?.id,
      createdAt: props.originalBlog?.createdAt
    }

    Axios.post(`${API}/updateBlog`, params).then(res => {
      props.setPreBlog({ title: '', body: '', userId: props.user.id || '', author: props.user.name || '', tags: [], saga: '' });
      props.setCreatingBlog(false);
      props.setOriginalBlog(undefined);
    })
  }
}

export const deleteOrHideBlog = async (deleteBlog: boolean, hideBlog: boolean, id: string, createdAt: string) => {
  if (deleteBlog) {
    Axios.post(`${API}/updateBlog`, { delete: true, id: id, createdAt: createdAt })
  } else {
    Axios.post(`${API}/updateBlog`, { hide: !hideBlog, id: id, createdAt: createdAt })
  }
}

export const saveDraft = async (user: User, body: string) => {
  Axios.post(`${API}/saveDraft`, { ...user, draft: body })
}