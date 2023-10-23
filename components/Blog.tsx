'use client'
import Bin from "@/app/assets/Bin"
import Edit from "@/app/assets/Edit"
import Eye from "@/app/assets/Eye"
import EyeOff from "@/app/assets/EyeOff"
import { DATE_TYPE, DEFAULT_PROFILES_URL, profileImages } from "@/app/constants"
import { deleteOrHideBlog } from "@/app/helpers/api"
import { getDateAge, editBlog, handleImageUpload, colourConverter, useAutosizeTextArea } from "@/app/helpers/helpers"
import { BlogI, CommentI, PreBlog, User } from "@/app/types"
import { Dispatch, SetStateAction, useEffect, useRef, useState } from "react"
import ReactMarkdown from "react-markdown"
import remarkGfm from "remark-gfm"
import { Bubble } from "."
import dynamic from "next/dynamic"
import Modal from 'react-modal';
import ModalComponent from "./Modal"
import Image from "next/image"
import Heart from "@/app/assets/Heart"
import InfiniteScroll from "react-infinite-scroll-component"
import Refresh from "@/app/assets/Refresh"
import Send from "@/app/Send"
const MdEditor = dynamic(() => import('react-markdown-editor-lite'), {
  ssr: false,
});


interface BlogProps {
  blog: BlogI
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

export const Blog: React.FC<BlogProps> = ({ blog, owned, setPreBlog, preBlog, blogs, setBlogs, pageAuthor, currentUser, setOriginalBlog, setCreatingBlog, creatingBlog }) => {
  const [eyeHover, setEyeHover] = useState(false)
  const [isOpenBin, setIsOpenBin] = useState(false)
  const [isOpen, setIsOpen] = useState(false)
  const [isEditing, setIsEditing] = useState(false)
  const [loading, setLoading] = useState(true)
  const [index, setIndex] = useState(Math.floor(Math.random() * ((profileImages.length -1) - 0 + 1)) + 0)
  
  const [height, setHeight] = useState(0)

  const [editColour, setEditColour] = useState('#9C9C9C')
  const [binColour, setBinColour] = useState('#9C4F58')
  const [comment, setComment] = useState('')

  const [comments, setComments] = useState<CommentI[]>([
    {
    id: '1', name: 'john johnson',
    body: 'this is a comment!thta is really log and aoinawodi noawndoi naodna osndoinawo ndoan doiasndo naodn aosndo nasod no',
    image: 'koala.png', createdAt: '', likes: []
  },
    {
    id: '2', name: 'john johnson',
    body: 'this is a comment!thta is really log and aoinawodi noawndoi naodna osndoinawo ndoan doiasndo naodn aosndo nasod no',
    image: 'koala.png', createdAt: '', likes: []
  },
    {
    id: '3', name: 'john johnson',
    body: 'this is a comment!thta is really log and aoinawodi noawndoi naodna osndoinawo ndoan doiasndo naodn aosndo nasod no',
    image: 'koala.png', createdAt: '', likes: []
  },
    {
    id: '4', name: 'john johnson',
    body: 'this is a comment!thta is really log and aoinawodi noawndoi naodna osndoinawo ndoan doiasndo naodn aosndo nasod no',
    image: 'koala.png', createdAt: '', likes: []
  },
    {
    id: '5', name: 'john johnson',
    body: 'this is a comment!thta is really log and aoinawodi noawndoi naodna osndoinawo ndoan doiasndo naodn aosndo nasod no',
    image: 'koala.png', createdAt: '', likes: []
  },
    {
    id: '6', name: 'john johnson',
    body: 'this is a comment!thta is really log and aoinawodi noawndoi naodna osndoinawo ndoan doiasndo naodn aosndo nasod no',
    image: 'koala.png', createdAt: '', likes: []
  },
    {
    id: '7', name: 'john johnson',
    body: 'this is a comment!thta is really log and aoinawodi noawndoi naodna osndoinawo ndoan doiasndo naodn aosndo nasod no',
    image: 'koala.png', createdAt: '', likes: []
  },
    {
    id: '8', name: 'john johnson',
    body: 'this is a comment!thta is really log and aoinawodi noawndoi naodna osndoinawo ndoan doiasndo naodn aosndo nasod no',
    image: 'koala.png', createdAt: '', likes: []
  },
  ])
  const textAreaRef = useRef<HTMLTextAreaElement>(null);
  const blogRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    //getComments
    if (blogRef.current) {
      setHeight(blogRef.current.clientHeight);
    }
  }, [])

  
  useAutosizeTextArea(textAreaRef.current, comment);
  const handleChange = (evt: React.ChangeEvent<HTMLTextAreaElement>) => {
    const val = evt.target?.value;
    setComment(val);
  };

  const toggleVisibility = (state: boolean) => {
    deleteOrHideBlog(false, blog.visible, blog.id, blog.createdAt).then(res => {
      setEyeHover(state);
      const tempBlogs = blogs;
      tempBlogs[blogs.findIndex(b => b.id === blog.id)].visible = state;
      setBlogs(tempBlogs);
      setIsOpenBin(false);
    }).catch((e: Error) => alert(e.message))
  }
  const deleteBlog = () => {
    deleteOrHideBlog(true, false, blog.id, blog.createdAt).then(res => {
      const tempBlogs = blogs.filter(b => b.id !== blog.id);
      setBlogs(tempBlogs);
      setIsOpenBin(false);
    }).catch((e: Error) => alert(e.message))
  }

  const incrementIndex = () => {
    if (index >= profileImages.length -1) {
      setIndex(0)
    } else {
      setIndex(index + 1)
    }
    console.log(index, profileImages.length)
  }

  const leaveComment = () => {
    const tempComments = comments
    tempComments. push({
      id: Math.random().toString(),
      name: "binn hoola",
      body: comment,
      image: profileImages[index],
      createdAt: "",
      likes: []
    })
    setComments(tempComments)
    setComment('')
  }

  return (
    <div className="flex flex-row">
      <div className="flex flex-col w-2/6 mr-20 ml-5 p-8 pt-0 rounded-2xl" style={{maxHeight: height}}>
        <span className="mb-4 font-semibold text-xl">Comments</span>
        <div className="flex flex-row mb-5 bottom-1 border-sky-300 px-5 items-center">
          <div onClick={() => incrementIndex()} className="mr-2 relative h-fit">
            <Refresh className="absolute -right-1 -bottom-1" fill="#3654A6" height={20}/>
            <Image className='rounded-full m-0 h-fit mr-2' src={DEFAULT_PROFILES_URL + profileImages[index]} alt='profile' width={40} height={40} />
          </div>
          
          <textarea ref={textAreaRef} value={comment} onChange={handleChange} placeholder="leave a comment"
            className="w-full resize-none flex font-normal text-sm rounded-xl bg-neutral-100 px-3 py-2 h-0" />
          <Send className="ml-5" onClick={() => leaveComment()} height={30} fill="#ffffff00" stroke="#333"/>
        </div>
        <div className="flex flex-col font-normal text-base overflow-scroll shadow-md h-auto p-5 pb-0 rounded-2xl">
          {comments.map((c) => {
            return <Comment key={c.id} comment={c} id={currentUser.id} />
          })}
        </div>
      </div>
      <div ref={blogRef} className='flex-col flex mb-20 w-3/6'>
        <div className='flex-row flex justify-between items-center'>
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
              </div></div>) : (<ReactMarkdown className={`${blog.tags.length > 0 ? 'mb-5' : ''} markdown`} remarkPlugins={[remarkGfm]} linkTarget={'_blank'}>{blog.body}</ReactMarkdown>)}
        
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
      </div>
    </div>
  )
}


interface CommentProps {
  comment: CommentI,
  id: string
}
const Comment = ({ comment, id }: CommentProps) => {
  const [likes, setLikes] = useState(comment.likes)
  const [colours, setColours] = useState({fill: '#efa', stroke: '#333', tw: 'bg-blue-500'})
  let liked = likes.includes(id)
  
  useEffect(() => {
    setColours(colourConverter(comment.image))
  }, [comment.image])

  const toggleLike = () => {
    let tempLikes = likes
    if (liked) {
      tempLikes = tempLikes.filter(l => l !== id)
    } else {
      tempLikes.push(id)
    }
    setLikes([...tempLikes])
  }
  return (
    <div className="flex flex-row mb-6">
      <Image className='rounded-full m-0 h-fit mr-2' src={DEFAULT_PROFILES_URL + comment.image} alt='profile' width={40} height={40} />
      <div className="flex flex-col flex-shrink w-full">
        <div className="flex flex-row items-center mb-1 justify-between">
          <span className={`font-light text-sm ${colours.tw}`}>{comment.name}</span>
          <div onClick={() => toggleLike()} className="flex flex-row items-center">
            
            <span className={`font-normal text-sm mr-1 ${colours.tw}`}>{likes.length}</span>
            <Heart className="cursor-pointer" stroke={colours.stroke} strokeWidth={1.25} fill={likes.includes(id) ? colours.fill : "#ffffff00"} width={25} />
          </div>
        </div>
        <span className="font-light text-sm">{comment.body}</span>
      </div>
    </div>
  );
}
