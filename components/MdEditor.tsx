'use client'
import { handleImageUpload } from '@/app/helpers/helpers';
import { BlogI, PreBlog, User } from '@/app/types';
import React, { Dispatch, SetStateAction, useState } from 'react'
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import ModalComponent from './Modal';
import dynamic from 'next/dynamic';
import { saveDraft } from '@/app/helpers/api';

const Editor = dynamic(() => import('react-markdown-editor-lite'), {
  ssr: false,
});

interface MdEditorI {
  preBlog: PreBlog
  setPreBlog: Dispatch<SetStateAction<PreBlog>>
  isEditing: boolean
  setIsEditing: Dispatch<SetStateAction<boolean>>
  currentUser: User
  setCurrentUser: Dispatch<SetStateAction<User>>
  setCreatingBlog: Dispatch<SetStateAction<boolean>>
  pageAuthor: User
  setOriginalBlog: Dispatch<SetStateAction<BlogI | undefined>>
  originalBlog: BlogI | undefined
  setBlogs: Dispatch<SetStateAction<BlogI[]>>
  blogs: BlogI[]
}
export const MdEditor = (props: MdEditorI) => {
  const [isOpen, setIsOpen] = useState(false)

  const saveDraftHelper = () => {
    saveDraft(props.currentUser, props.preBlog.body, props.currentUser.jwt ?? '').then(res => {
      props.setPreBlog({ title: '', body: '', userId: props.currentUser.id, author: props.currentUser.name, tags: [], saga: '' });
      props.setCreatingBlog(false);
      props.setCurrentUser(prev => ({...prev, draft: props.preBlog.body}))
    })
  }

  return (
    <div className='mb-10 w-2/5'>
      <div className='border-sky-300 border-2 rounded-2xl overflow-clip flex h-fit max-h-full mb-5'>
        <Editor
          value={props.preBlog.body}
          allowPasteImage
          onImageUpload={handleImageUpload}
          view={{ menu: true, html: false, md: true }}
          canView={{ menu: true, html: true, both: false, fullScreen: false, hideMenu: false, md: true }}
          placeholder='blog loblaw'
          onChange={(text) => props.setPreBlog(prev => ({ ...prev, body: text.text }))}
          plugins={['mode-toggle', 'link', 'block-code-inline', 'font-strikethrough', 'font-bold', 'font-italic', 'divider', 'block-code-block', 'block-quote', 'list-unordered', 'list-ordered', 'image', 'block-wrap']}
          className='flex flex-grow rounded-2xl border-none h-fit max-h-full min-h-500 max-w-full'
          renderHTML={text => <ReactMarkdown remarkPlugins={[remarkGfm]} linkTarget={'_blank'}>{text}</ReactMarkdown>}
        />
      </div>
      <div className='flex-row flex justify-between mt-3'>
        <button onClick={() => { props.setCreatingBlog(false); props.setIsEditing(false)}} className='bg-neutral-200 px-8 py-2 rounded-full text-neutral-400 font-bold'>cancel</button>
        <div>
          <button hidden={props.isEditing} onClick={saveDraftHelper} disabled={props.preBlog.body === props.currentUser.draft} className={`${props.preBlog.body !== props.currentUser.draft ? 'bg-sky-300' : 'bg-sky-200'} px-8 mr-3 py-2 rounded-full text-neutral-50 font-bold`}>save</button>
          <button onClick={() => setIsOpen(true)} disabled={props.preBlog.body === ''} className={`${props.preBlog.body === '' ? 'bg-sky-200' : 'bg-sky-300'} px-8 py-2 rounded-full text-neutral-50 font-bold`}>confirm</button>
        </div>
      </div>
      <ModalComponent setIsOpen={setIsOpen} isOpen={isOpen} preBlog={props.preBlog} setPreBlog={props.setPreBlog} blogs={props.blogs}
        setBlogs={props.setBlogs} isEditing={props.isEditing} setIsEditing={props.setIsEditing} pageAuthor={props.pageAuthor} currentUser={props.currentUser} orginalBlog={props.originalBlog}
        setOriginalBlog={props.setOriginalBlog} setCreatingBlog={props.setCreatingBlog} />
    </div>
  )
}

export default MdEditor
