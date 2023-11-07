'use client'
import Bin from "@/app/assets/Bin"
import Edit from "@/app/assets/Edit"
import Eye from "@/app/assets/Eye"
import EyeOff from "@/app/assets/EyeOff"
import { DATE_TYPE, DEFAULT_PROFILES_URL, profileImages } from "@/app/constants"
import { deleteOrHideBlog, getComments } from "@/app/helpers/api"
import { getDateAge, editBlog, handleImageUpload, colourConverter, useAutosizeTextArea, getShares, likeBlogHelper } from "@/app/helpers/helpers"
import { BlogI, CommentI, PreBlog, User } from "@/app/types"
import { Dispatch, SetStateAction, useEffect, useRef, useState } from "react"
import ReactMarkdown from "react-markdown"
import remarkGfm from "remark-gfm"
import { Bubble } from "."
import dynamic from "next/dynamic"
import Modal from 'react-modal';
import ModalComponent from "./Modal"
import CommentIcon from "@/app/assets/CommentIcon"
import Share from "@/app/assets/Share"
import Heart from "@/app/assets/Heart"
import CommentModal from "./CommentModal"
const MdEditor = dynamic(() => import('react-markdown-editor-lite'), {
  ssr: false,
});


interface BlogProps {
  blogT: BlogI
  owned: boolean
  preBlog: PreBlog
  setPreBlog: Dispatch<SetStateAction<PreBlog>>
  blogs: BlogI[]
  setBlogs: Dispatch<SetStateAction<BlogI[]>>
  pageAuthor: User
  currentUser: User
  setOriginalBlog: Dispatch<SetStateAction<BlogI | undefined>>
  creatingBlog: boolean
  setCreatingBlog: Dispatch<SetStateAction<boolean>>
}

export const Blog: React.FC<BlogProps> = ({ blogT, owned, setPreBlog, preBlog, blogs, setBlogs, pageAuthor, currentUser, setOriginalBlog, setCreatingBlog, creatingBlog }) => {
  const [eyeHover, setEyeHover] = useState(false)
  const [isOpenBin, setIsOpenBin] = useState(false)
  const [isOpen, setIsOpen] = useState(false)
  const [isOpenComments, setIsOpenComments] = useState(false)
  const [isEditing, setIsEditing] = useState(false)
  
  const [blog, setBlog] = useState<BlogI>(blogT)

  const [editColour, setEditColour] = useState('#9C9C9C')
  const [binColour, setBinColour] = useState('#9C4F58')

  const [comments, setComments] = useState<CommentI[]>([])

  let liked = blog.likes.includes(currentUser.id)
  const blogRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    getComments(blog.id, setComments)
  }, [])

  const toggleVisibility = (state: boolean) => {
    deleteOrHideBlog(false, blog.visible, blog.id, blog.createdAt, currentUser.jwt).then(res => {
      setEyeHover(state);
      const tempBlogs = blogs;
      tempBlogs[blogs.findIndex(b => b.id === blog.id)].visible = state;
      setBlogs(tempBlogs);
      setIsOpenBin(false);
    }).catch((e: Error) => alert(e.message))
  }
  const deleteBlog = () => {
    deleteOrHideBlog(true, false, blog.id, blog.createdAt, currentUser.jwt).then(res => {
      const tempBlogs = blogs.filter(b => b.id !== blog.id);
      setBlogs(tempBlogs);
      setIsOpenBin(false);
    }).catch((e: Error) => alert(e.message))
  }


  return (
    <div className="flex-col flex mb-20 w-2/5">
      <div className="flex flex-col absolute -ml-16 items-center justify-between">
        <div className="flex flex-col text-center text-[#333] cursor-pointer" onClick={() => likeBlogHelper({ userId: currentUser.id, blog, setBlog, liked })}>
          <Heart width={30} strokeWidth={1.5} stroke="#333" fill={blog.likes?.includes(currentUser.id) ? '#6ED0D7' : "#ffffff00"}/>
          <span>{blog.likes?.length ?? 0}</span>
        </div>
        <div className="my-4 flex flex-col text-center text-[#333] cursor-pointer" onClick={() => setIsOpenComments(true)}>
          <CommentIcon width={30} stroke="#333"/>
          <span>{comments.length}</span>
        </div>
        <div className="flex flex-col text-center text-[#333] cursor-pointer" onClick={() => navigator.clipboard.writeText('sagas.finnholland.dev')}>
          <Share width={30} stroke="#333"/>
          <span>{getShares(blog.createdAt)}</span>
        </div>
        
      </div>
      <div className='flex-row flex justify-between items-center cursor-pointer' onClick={() => setIsOpenComments(true)}>
        <div className='flex-col flex justify-between'>
          <span className='text-xl font-semibold'>{blog.title}</span>
          <div className='flex-row'>
            <span title={blog.editedAt ? getDateAge(blog.editedAt, DATE_TYPE.EDIT) : ''}
              className='text-sm mt-1'>{getDateAge(blog.createdAt, DATE_TYPE.BLOG)} {blog.editedAt ? '*' : ''}</span>
          </div>
        </div>
          <div className='flex-row flex items-center'>
            <Bubble name={blog.saga} type='saga' />
            {owned ? (
              <div className='flex-row flex pl-3'>
                <Edit className='cursor-pointer' stroke={editColour} width={25}
                  onClick={() => { editBlog({ currentUser, setPreBlog, preBlog, blog, creatingBlog, setCreatingBlog }); setIsEditing(!isEditing) }}
                  onMouseEnter={() => setEditColour('#0092B2')} onMouseLeave={() => setEditColour('#9C9C9C')}/>
                {blog.visible && !eyeHover || !blog.visible && eyeHover ?
                  (<Eye className='mx-3 cursor-pointer' stroke='#9C9C9C' width={25} 
                    onMouseEnter={() => setEyeHover(true)} onMouseLeave={() => setEyeHover(false)}
                    onClick={() => toggleVisibility(true)} />) :
                  (<EyeOff className='mx-3 cursor-pointer' stroke='#0092B2' width={25}
                    onMouseEnter={() => setEyeHover(true)} onMouseLeave={() => setEyeHover(false)}
                    onClick={() => toggleVisibility(false)} />)}
                <Bin className='cursor-pointer' stroke={binColour} width={25}
                  onClick={() => setIsOpenBin(true)} onMouseEnter={() => setBinColour('#DD2E44')} onMouseLeave={() => setBinColour('#9C4F58')}/>
              </div>
            ) : (null)}
          </div>
        </div>
        {isEditing ? (<div className={`${blog.tags.length > 0 ? 'mb-10' : ''}`}>
              <div className='border-sky-300 border-2 rounded-2xl overflow-clip flex h-fit max-h-full my-5'>
                <MdEditor
                  value={preBlog.body}
                  allowPasteImage
                  onImageUpload={handleImageUpload}
                  view={{ menu: true, html: false, md: true }}
                  canView={{ menu: true, html: true, both: false, fullScreen: false, hideMenu: false, md: true }}
                  placeholder='blog loblaw'
                  onChange={(text) => setPreBlog(prev => ({ ...prev, body: text.text }))}
                  plugins={['mode-toggle', 'link', 'block-code-inline', 'font-strikethrough', 'font-bold', 'font-italic', 'divider', 'block-code-block', 'block-quote', 'list-unordered', 'list-ordered', 'image', 'block-wrap']}
                  className='flex flex-grow rounded-2xl border-none h-fit max-h-full min-h-500 max-w-full'
                  renderHTML={text => <ReactMarkdown remarkPlugins={[remarkGfm]} linkTarget={'_blank'}>{text}</ReactMarkdown>}
                />
              </div>
              <div className='flex-row flex justify-between mt-3'>
                <button onClick={() => { setIsEditing(false)}} className='bg-neutral-200 px-8 py-2 rounded-full text-neutral-400 font-bold'>cancel</button>
                <div>
                  <button onClick={() => setIsOpen(true)} disabled={preBlog.body === ''} className={`${preBlog.body === '' ? 'bg-sky-200' : 'bg-sky-300'} px-8 py-2 rounded-full text-neutral-50 font-bold`}>confirm</button>
                </div>
          </div></div>) : (
              <div ref={blogRef}>
                <ReactMarkdown className={`${blog.tags.length > 0 ? 'mb-5' : ''} markdown`} remarkPlugins={[remarkGfm]} linkTarget={'_blank'}>
                  {blog.body}
                </ReactMarkdown>
              </div>
        )}
        
        <div className='flex-row flex flex-wrap'>
          {blog.tags.map((tag) => {
            return <Bubble key={tag} name={tag} type='tag'/>
          })}
        </div>
        <Modal isOpen={isOpenBin} onRequestClose={() => setIsOpenBin(false)} ariaHideApp={false}
                className='border-0 left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-1/3 fixed focus-visible:outline-none'>
                <div className='flex-col flex w-full bg-white p-8 shadow-md rounded-2xl'>
            <p>{`Delete blog "${blog.title}" ? This cannot be undone`}</p>
            <div className='flex flex-row items-center h-12 justify-between mt-3'>
              <span className='cursor-pointer border-2 border-red-600 rounded-full w-28 p-2 text-center font-medium text-red-600'
                onClick={() => deleteBlog()}>yes</span>
              <span className='cursor-pointer border-2 border-sky-300 rounded-full w-28 p-2 text-center font-medium text-sky-300'
                onClick={() => setIsOpenBin(false)}>no</span>
            </div>

                </div>
        </Modal>
        <ModalComponent setIsOpen={setIsOpen} isOpen={isOpen} preBlog={preBlog} setPreBlog={setPreBlog} blogs={blogs}
        setBlogs={setBlogs} isEditing={isEditing} setIsEditing={setIsEditing} pageAuthor={pageAuthor} currentUser={currentUser} orginalBlog={blog}
        setOriginalBlog={setOriginalBlog} setCreatingBlog={setCreatingBlog} />
      <CommentModal isOpen={isOpenComments} setIsOpen={setIsOpenComments} userId={currentUser.id} blog={blog} liked={liked} setBlog={setBlog}
        title={blog.title} saga={blog.saga} comments={comments} setComments={setComments} createdAt={blog.createdAt}  editedAt={blog.editedAt}/>
    </div>
  )
}
