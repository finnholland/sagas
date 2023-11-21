import {Plus} from '@/app/assets'
import { addOrRemoveTag, isEmpty } from '@/app/helpers/helpers'
import { BlogI, PreBlog, User } from '@/app/types'
import React, { Dispatch, SetStateAction, useState } from 'react'
import { Bubble } from '.'
import Modal from 'react-modal';
import { updateBlog } from '@/app/helpers/api'
import Axios from 'axios';
import { API } from '@/app/constants'

interface ModalI {
  isOpen: boolean
  setIsOpen: Dispatch<SetStateAction<boolean>>
  preBlog: PreBlog
  setPreBlog: Dispatch<SetStateAction<PreBlog>>
  blogs: BlogI[]
  setBlogs: Dispatch<SetStateAction<BlogI[]>>
  isEditing: boolean
  setIsEditing: Dispatch<SetStateAction<boolean>>
  pageAuthor: User
  currentUser: User
  orginalBlog: BlogI | undefined
  setOriginalBlog: Dispatch<SetStateAction<BlogI | undefined>>
  setCreatingBlog: Dispatch<SetStateAction<boolean>>
}
const ModalComponent = (props: ModalI) => {
  const [tag, setTag] = useState('')

  const createBlog = () => {
    if (props.isEditing) {
      updateBlog({ setIsOpen: props.setIsOpen, preBlog: props.preBlog, setPreBlog: props.setPreBlog, originalBlog: props.orginalBlog, setOriginalBlog: props.setOriginalBlog, setCreatingBlog: props.setCreatingBlog, user: props.currentUser  });
      props.setIsEditing(false)
    } else {

      props.setIsOpen(false);

      let newSagas = props.currentUser.sagas || [];
      if (!isEmpty(props.preBlog.saga)) {
        const index = newSagas.findIndex(t => t.saga.toLowerCase() === props.preBlog.saga.toLowerCase());
        if (index >= 0) {
          newSagas[index].updated = '';
        } else if (index === -1) {
          newSagas.push({saga: props.preBlog.saga, updated: ''})
        }
      }

      const newTags = props.preBlog.tags.filter((str: string) => !isEmpty(str));
      let combinedTags = Array.from(new Set(props.currentUser.tags.concat(newTags)));
      if (combinedTags === props.currentUser.tags) {
        combinedTags = []
      }

      Axios.post(`${API}/createBlog`,
        { ...props.preBlog, userTags: combinedTags, userSagas: newSagas, createdAt: props.currentUser.createdAt },
        { headers: { Authorization: props.currentUser.jwt } }
      ).then(res => {
        props.setPreBlog({ title: '', body: '', userId: props.currentUser.id, author: props.currentUser.name, tags: [], saga: '' });
        props.setCreatingBlog(false);
      })
    }
  }

  const createTag = () => {
    if (!props.isEditing) {
      props.setPreBlog(prev => ({ ...prev, tags: [...prev.tags, tag] }))
      setTag('');
    }
  }

  return (
    <Modal isOpen={props.isOpen} onRequestClose={() => props.setIsOpen(false)} ariaHideApp={false}
      className='border-0 left-1/2 top-1/2 my-10 -translate-x-1/2 -translate-y-1/2 w-1/3 fixed focus-visible:outline-none'>
      <div className='flex-col flex w-full max-h-screen bg-white p-5 shadow-md rounded-2xl'>
        <div className='w-full py-1 flex'>
          <span className='font-bold text-sky-300 mr-3 w-10'>Title</span>
          <input className='border-b-neutral-200 border-b-2 focus:border-sky-300 focus:outline-none' value={props.preBlog.title}
            type="text" placeholder='title' onChange={(e) => props.setPreBlog(prev => ({ ...prev, title: e.target.value }))} />
        </div>
        <div className='w-full flex my-6'>
          <span className='font-bold text-sky-300 mr-3 w-10'>Saga</span>
          <input disabled={props.isEditing} className='border-b-neutral-200 border-b-2 focus:border-sky-300 focus:outline-none' value={props.preBlog.saga}
            type="text" placeholder='saga' onChange={(e) => props.setPreBlog(prev => ({ ...prev, saga: e.target.value }))} />
        </div>
        <div className='w-full flex'>
          <span className='font-bold text-sky-300 mr-3 w-10'>Tags</span>
          <div className='flex flex-row items-center'>
            <input disabled={props.isEditing} className='border-b-neutral-200 border-b-2 focus:border-sky-300 focus:outline-none mr-3' type="text" placeholder='tag' onChange={(e) => setTag(e.target.value)} />
            <Plus onClick={() => createTag()} width={20}/> 
          </div>
        </div>
        <span className={`${props.preBlog.tags.length>0 ? '' : 'hidden'} text-sm text-neutral-600 mt-5 mb-1`}>current tags</span>
        <div className={`${props.preBlog.tags.length > 0 ? '' : 'hidden'} flex flex-row w-full flex-wrap mb-3`}>
          {props.preBlog.tags.map((tag) => (
            <Bubble key={tag} name={tag} preBlog={props.preBlog} type='tag' setPreBlog={props.setPreBlog}/>
          ))}
        </div>
        <span className='text-sm text-neutral-600 mt-5 mb-1'>previous tags</span>
        <div className='flex flex-row w-full flex-wrap mb-3'>
          {props.pageAuthor.tags.map((tag) => (
            <div key={tag} onClick={() => addOrRemoveTag({ tag: tag, preBlog: props.preBlog, setPreBlog: props.setPreBlog })}
              className={`flex-row flex items-center mr-3 mb-2 px-3 py-1 border-1 rounded-full border-sky-300 cursor-pointer select-none ${props.preBlog.tags.includes(tag) ? 'hidden' : ''}`}>
              <span className='mr-1 text-neutral-500'>{tag}</span>
              <span><Plus width={15} /></span>
            </div>
          ))}
        </div>
        <div className='flex-row flex justify-between'>
          <button onClick={() => props.setIsOpen(false) }
            className='bg-neutral-200 px-8 py-2 rounded-full text-neutral-400 font-bold'>back</button>
          <button onClick={() => createBlog()} disabled={props.preBlog.title === '' || props.preBlog.saga === ''}
            className={`${props.preBlog.title === '' || props.preBlog.saga === '' ? 'bg-sky-200' : 'bg-sky-300'} px-8 py-2 rounded-full text-neutral-50 font-bold`}>{props.isEditing ? 'update' : 'create'}</button>
        </div>
      </div>
    </Modal>
  )
}

export default ModalComponent
