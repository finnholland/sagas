'use client'
import Send from '@/app/Send'
import Heart from '@/app/assets/Heart'
import Refresh from '@/app/assets/Refresh'
import { DATE_TYPE, DEFAULT_PROFILES_URL, profileImages } from '@/app/constants'
import { colourConverter, getDateAge, getShares, likeBlogHelper, useAutosizeTextArea } from '@/app/helpers/helpers'
import { BlogI, CommentI, User } from '@/app/types'
import React, { Dispatch, SetStateAction, useEffect, useRef, useState } from 'react'
import Image from "next/image"
import Share from '@/app/assets/Share'
import CommentIcon from '@/app/assets/CommentIcon'
import Modal from 'react-modal';
import { Bubble } from './Bubble'
import InfiniteScroll from 'react-infinite-scroll-component'
import Mention from '@/app/assets/Mention'
import { createComment, likeItem } from '@/app/helpers/api'
import { v4 as uuidv4 } from 'uuid';
import moment from 'moment'
import Save from '@/app/assets/Save'

interface CommentModalI {
  userId: string
  name: string
  blog: BlogI
  setBlog: Dispatch<SetStateAction<BlogI>>
  comments: CommentI[]
  setComments: Dispatch<SetStateAction<CommentI[]>>
  isOpen: boolean
  setIsOpen: Dispatch<SetStateAction<boolean>>
  title: string
  createdAt: string
  saga: string
  editedAt: string,
  liked: boolean,
}
const CommentModal: React.FC<CommentModalI> = ({userId, name, blog, setBlog, comments, setComments, isOpen, setIsOpen, title, createdAt, saga, editedAt, liked}) => {
  let indexT: number = profileImages.findIndex(i => i === (localStorage.getItem('localImage')) ?? '')
  
  
  const [local, setLocal] = useState(localStorage.getItem('localAuthor') !== null)
  const [comment, setComment] = useState('')
  const [author, setAuthor] = useState('')
  const [index, setIndex] = useState(indexT >= 0 ? indexT : Math.floor(Math.random() * ((profileImages.length -1) - 0 + 1)) + 0)
  const [sendHover, setSendHover] = useState(false)
  const [remember, setRemember] = useState(false)
  
  const incrementIndex = () => {
    if (index >= profileImages.length -1) {
      setIndex(0)
    } else {
      setIndex(index + 1)
    }
  }

  useEffect(() => {
    if (localStorage.getItem('localAuthor') !== null) {
      setAuthor(localStorage.getItem('localAuthor') ?? '')
    } else {
      setAuthor(name?.replace(' ', '_') ?? '')
    }
  }, [name])

  const createCommentHelper = () => {
    if (remember) {
      localStorage.setItem('localAuthor', author)
      localStorage.setItem('localImage', profileImages[index])
      setLocal(localStorage.getItem('localAuthor') !== null)
    }
    createComment(userId, blog.id, author, comment, profileImages[index]).then(res => {
      const tempComments = comments
      tempComments.unshift({
        id: uuidv4(),
        author: author,
        body: comment,
        image: profileImages[index],
        createdAt: moment().format('YYYY-MM-DDTHH:mm:ssZ'),
        likes: []
      })
      setComments(tempComments)
      setComment('')
    })
  }

  const textAreaRef = useRef<HTMLTextAreaElement>(null);
  useAutosizeTextArea(textAreaRef.current, comment);
  const handleChange = (evt: React.ChangeEvent<HTMLTextAreaElement>) => {
    const val = evt.target?.value;
    setComment(val);
  };
  const handleChangeAuthor = (evt: React.ChangeEvent<HTMLTextAreaElement>) => {
    const val = evt.target.value.replace(/[^\w.\-]/, '_');
    setAuthor(val);
  };
  const storageHelper = () => {
    localStorage.removeItem('localAuthor');
    localStorage.removeItem('localImage');
    setLocal(localStorage.getItem('localAuthor') !== null);
  };

  return (
    <Modal isOpen={isOpen} onRequestClose={() => setIsOpen(false)} ariaHideApp={false}
      className='border-0 left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-2/5 fixed focus-visible:outline-none'>
      <div className="flex flex-col absolute -ml-20 p-4 justify-between bg-white shadow-md rounded-2xl">
        <div className="flex flex-col text-center text-[#333] cursor-pointer" onClick={() => likeBlogHelper({ userId, blog, setBlog, liked })}>
          <Heart width={30} strokeWidth={1.5} stroke="#333" fill={blog.likes?.includes(userId) ? '#6ED0D7' : "#ffffff00"}/>
          <span>{blog.likes?.length ?? 0}</span>
        </div>
        <div className="my-4 flex flex-col text-center text-[#333] cursor-pointer">
          <CommentIcon width={30} stroke="#333"/>
          <span>{comments.length}</span>
        </div>
        <div className="flex flex-col text-center text-[#333] cursor-pointer" onClick={() => navigator.clipboard.writeText('sagas.finnholland.dev')}>
          <Share width={30} stroke="#333"/>
          <span>{getShares(blog.createdAt)}</span>
        </div>
      </div>
      <div className="flex flex-col w-full p-8 bg-white rounded-2xl shadow-md">

        <div className='flex-row flex justify-between items-center'>
          <div className='flex-col flex justify-between'>
            <span className='text-xl font-semibold'>{title}</span>
            <div className='flex-row'>
              <span title={editedAt ? getDateAge(editedAt, DATE_TYPE.EDIT) : ''}
              className='text-sm mt-1'>{getDateAge(createdAt, DATE_TYPE.BLOG)} {editedAt ? '*' : ''}</span>
            </div>
          </div>
          <div className='flex-row flex items-center'>
            <Bubble name={saga} type='saga' />
          </div>
        </div>
          
        <div className="flex flex-row my-6 bottom-1 border-sky-300 px-8 items-center">
          
          <div className='flex-row flex w-full items-end'>
            <div onClick={() => incrementIndex()} className="mr-2 relative flex cursor-pointer items-center w-fit">
              <Refresh className="absolute -top-1.5 -left-1.5 -right-1.5 -bottom-1.5" fill={ colourConverter(profileImages[index]).stroke} />
              <Image className='rounded-full m-0' src={DEFAULT_PROFILES_URL + profileImages[index]} alt='profile' width={45} height={45} />
            </div>
            <div className='flex flex-col w-full'>
              <div className='flex flex-row items-center justify-between mx-5'>
                <textarea ref={textAreaRef} value={author} onChange={handleChangeAuthor} placeholder="your name"
                  className={`resize-none font-light text-sm h-6 focus-visible:outline-none`}
                  style={{ color: (colourConverter(profileImages[index]).fill) }} />
                <div>
                  <label htmlFor="default-checkbox" className="text-xs font-light text-gray-600 mr-2 select-none">remember</label>
                  <input onChange={(e) => setRemember(e.target.checked)} id="default-checkbox" type="checkbox" value="" className="w-3 h-3 text-blue-600 bg-gray-100 border-gray-300 rounded"/>
                  {local ? 
                    <span className="text-xs font-light text-red-600 ml-4 select-none" onClick={() => storageHelper()}>
                      clear
                    </span> : null}
                  
                </div>
              </div>
              <textarea ref={textAreaRef} value={comment} onChange={handleChange} placeholder="leave a comment"
              className="mx-5 resize-none flex font-normal text-sm rounded-2xl bg-neutral-100 px-4 py-2 h-9" />
            </div>
            

            <Send className="cursor-pointer" onClick={() => { (comment.trim() === '' || author.trim() === '') ? null : createCommentHelper() }}
                onMouseEnter={() => setSendHover(true)} onMouseLeave={() => setSendHover(false)} strokeWidth={1} height={40} fill={sendHover ? "#75D0ED" : "#ffffff00"} stroke="#333" />
          </div>
        </div>
        <InfiniteScroll
            dataLength={comments?.length || 0}
            next={() => console.log('loading new blogs')}
            hasMore={false}
            loader={''}
            
            className='max-h-3/4-screen px-8 overflow-scroll flex flex-col'>
            {comments.map((c) => {
              return <Comment key={c.id} comment={c} userId={userId} setComment={setComment}/>
            })}
        </InfiniteScroll>
      </div>
    </Modal>
  )
}


interface CommentProps {
  comment: CommentI,
  userId: string,
  setComment: Dispatch<SetStateAction<string>>
}
const Comment = ({ comment, userId, setComment }: CommentProps) => {
  const [likes, setLikes] = useState(comment.likes)
  const [colours, setColours] = useState({fill: '#efa', stroke: '#333', tw: 'bg-blue-500'})
  let liked = likes.includes(userId)
  
  useEffect(() => {
    setColours(colourConverter(comment.image))
  }, [comment.image])

  const toggleLike = () => {
    likeItem(userId, comment.id, comment.createdAt, comment.likes, liked).then(() => {
      if (liked) {
        let commentT = comment;
        commentT.likes =commentT.likes.filter(id => id !== userId)
        setLikes([...commentT.likes])
      } else {
        let commentT = comment;
        commentT.likes.push(userId)
        setLikes([...commentT.likes])
      }
    })
  }
  return (
    <div className="flex flex-row mb-6">
      <Image className='rounded-full m-0 h-fit mr-2' src={DEFAULT_PROFILES_URL + comment.image} alt='profile' width={40} height={40} />
      <div className="flex flex-col flex-shrink w-full">
        <div className="flex flex-row items-center mb-1 justify-between">
          <span className={`font-light text-sm ${colours.tw}`}>{comment.author}</span>
          <div className="flex flex-row items-center">
            <div className='flex-row flex select-none' onClick={() => toggleLike()}>
              <span className={`font-normal text-sm mr-1 ${colours.tw}`}>{likes.length}</span>
              <Heart className="cursor-pointer" stroke={colours.stroke} strokeWidth={1.25} fill={likes.includes(userId) ? colours.fill : "#ffffff00"} width={20} />
            </div>
            <Mention onClick={() => setComment(prev => '@'+prev+comment.author)} className="cursor-pointer ml-2" stroke={colours.stroke} strokeWidth={1.25} width={20} />
          </div>
        </div>
        <span className="font-light text-sm">{comment.body}</span>
      </div>
    </div>
  );
}

export default CommentModal