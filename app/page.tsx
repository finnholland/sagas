'use client'
import React, { ChangeEvent, useEffect, useRef, useState } from 'react';
import Image from 'next/image'
import "react-markdown-editor-lite/lib/index.css";
import dynamic from 'next/dynamic';
import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'
import 'github-markdown-css/github-markdown-light.css'
import Axios from 'axios';
import {API, DATE_TYPE} from './constants'
import { dataURLtoFile, getDateAge, uploadFile } from './helpers';
import { Amplify, Auth } from 'aws-amplify';
import { userPool } from './constants';
import { v4 as uuidv4 } from 'uuid';

Amplify.configure({
  Auth: {
    region: userPool.REGION,
    userPoolId: userPool.USER_POOL_ID,
    userPoolWebClientId: userPool.USER_POOL_APP_CLIENT_ID
  }
})

const MdEditor = dynamic(() => import('react-markdown-editor-lite'), {
  ssr: false,
});
let last_evaluated_key =  ''

interface PreBlog {
  title: string,
  body: string,
  userId: string,
  author: string,
  tags: string[],
  saga: string
}
interface Blog {
  id: string
  createdAt: string
  title: string,
  body: string,
  userId: string,
  visible: boolean,
  tags: string[],
  saga: string
}
interface User {
  location: string,
  bio: string
  createdAt: string,
  id: string,
  name: string,
  sagas: Saga[],
  tags: string[],
  type: string
}

interface Saga {
  saga: string,
  updated: string
}



export default function Home() {
  const [currentUser, setCurrentUser] = useState<User>({location: '', bio: '', createdAt: '', id: '', name: '', sagas: [], tags: [], type: ''})
  const [pageAuthor, setPageAuthor] = useState<User>({location: '', bio: '', createdAt: '', id: '', name: '', sagas: [], tags: [], type: ''})
  const [preBlog, setPreBlog] = useState<PreBlog>({title: '', body: '', userId: currentUser.id, author: currentUser.name, tags: [], saga: ''});
  const [blogs, setBlogs] = useState<Blog[]>();
  const [authenticated, setAuthenticated] = useState(false)
  const [loaded, setLoaded] = useState(false)
  const [creatingBlog, setCreatingBlog] = useState(false)
  const [loggingIn, setLoggingIn] = useState(false)
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')

  function handleEditorChange({ html, text }: { html: string, text: string }) {
    if (html && text)
      setPreBlog(prev => ({ ...prev, body: text }))
  }

  const handleImageUpload = (file: File) => {
    let uuid = uuidv4();
    return new Promise(resolve => {
      const reader = new FileReader();
      reader.onload = data => {
        if (data.target && data.target.result) {
          console.log(data.target.result)
          if (typeof data.target.result === 'string') {
            uploadFile('images/'+uuid, dataURLtoFile(data.target.result, 'images/'+uuid)).then(res => resolve(res))
          }
        }
      };
      reader.readAsDataURL(file);
    });
  };

  useEffect(() => {
    Auth.currentAuthenticatedUser().then((res) => {
      if (res != undefined) {
        getCurrentUser(res.username)
      }
    }).finally(() => setLoaded(true))
    Axios.get(`${API}/getBlogs`).then(res => {
      last_evaluated_key = res.data.last_evaluated_key
      setBlogs(res.data.items)
    });
    Axios.get(`${API}/getPageAuthor`).then(res => {
      setPageAuthor(res.data)
    });
  }, [])

  const nextPage = () => {
    const stringy = last_evaluated_key ? JSON.stringify(last_evaluated_key) : ''
    Axios.get(`${API}/getBlogs`, { params: { last_evaluated_key: stringy }}).then(res => {
      last_evaluated_key = res.data.last_evaluated_key
    })
  }

  const createBlog = () => {
    let newSagas = currentUser.sagas || [];
    const index = newSagas.findIndex(t => t.saga.toLowerCase() === preBlog.saga.toLowerCase());
    if (index >= 0) {
      newSagas[index].updated = '';
    } else if (index >= 0) {
      newSagas.push({saga: preBlog.saga, updated: ''})
    }
    if (preBlog.tags.length === 1 && preBlog.tags[0] === '') {
      setPreBlog(prev => ({ ...prev, tags: [] }))
    }
    
    let combinedTags = Array.from(new Set(currentUser.tags.concat(preBlog.tags)));
    if (combinedTags === currentUser.tags) {
      combinedTags = []
    }

    Axios.post(`${API}/createBlog`, { ...preBlog, userTags: combinedTags, userSagas: newSagas, createdAt: currentUser.createdAt }).then(res => {
      setPreBlog({ title: '', body: '', userId: currentUser.id, author: currentUser.name, tags: [], saga: '' });
      setCreatingBlog(false);
    })
  }

  const getCurrentUser = (id: string) => {
    setAuthenticated(true);
    Axios.get(`${API}/getCurrentUser`, {params: {id: id}}).then(res => {
      setCurrentUser(res.data)
      setPreBlog(prev => ({ ...prev, author: res.data.name, userId: res.data.id }))
    })
  }

  const authenticate = (login: boolean) => {
    if (login) {
      Auth.signIn(email, password).then((res) => {
        getCurrentUser(res.username)
      })
    } else {
      Auth.signOut().then(() => setAuthenticated(false)).catch(err => console.log('error signing out: ', err))
    }
  }

  if (!loaded) {
    return <div />
  } else {
    return (
      <div className=' px-10 py-10 flex-1 flex h-full flex-row justify-between items-center'>
        <div className='w-1/4 flex-3 text-center h-full px-10'>
          <div className='w-full h-full'>

          </div>
        </div>
        <div className='w-1/2 h-full px-20 flex flex-col pb-10'>

          {creatingBlog ? (<div>
            <div className='border-sky-300 border-2 rounded-2xl overflow-clip flex h-fit max-h-full'>
              <MdEditor
                allowPasteImage
                onImageUpload={handleImageUpload}
                view={{ menu: true, html: false, md: true }}
                canView={{ menu: true, html: true, both: false, fullScreen: false, hideMenu: false, md: true }}
                placeholder='blog loblaw'
                onChange={handleEditorChange}
                plugins={['mode-toggle', 'link', 'block-code-inline', 'font-strikethrough', 'font-bold', 'font-italic', 'divider', 'block-code-block', 'block-quote', 'list-unordered', 'list-ordered', 'image', 'block-wrap']}
                className='flex flex-grow rounded-2xl border-none h-fit max-h-full min-h-500'
                renderHTML={text => <ReactMarkdown remarkPlugins={[remarkGfm]} linkTarget={'_blank'}>{text}</ReactMarkdown>}
              />
            </div>
            <div className='flex-row flex justify-between mt-3'>
              <button onClick={() => setCreatingBlog(false)} className='bg-neutral-200 px-8 py-2 rounded-full text-neutral-400 font-bold'>cancel</button>
              <button onClick={() => createBlog()} disabled={preBlog.body == ''} className={`${preBlog.body == '' ? 'bg-sky-200' : 'bg-sky-300'} px-8 py-2 rounded-full text-neutral-50 font-bold`}>post</button>
            </div>
            <input type="text" placeholder='title' onChange={(e) => setPreBlog(prev => ({ ...prev, title: e.target.value }))} />
            <input type="text" placeholder='tags' onChange={(e) => setPreBlog(prev => ({ ...prev, tags: e.target.value.split(',') }))} />
            <input type="text" placeholder='saga' onChange={(e) => setPreBlog(prev => ({ ...prev, saga: e.target.value }))} />
          </div>) : (null)}
          {blogs?.map((item) => (
            <BlogItem key={item.id} blog={item}/>
          ))}
        </div>
        <div className='w-1/4 flex-3 h-full px-10 justify-between flex flex-col' >
          <div>
            <div className='flex flex-row mb-5'>
              <div>
                <Image className='rounded-2xl m-0' src='/profile.jpg' alt='profile' width={100} height={100} />
              </div>
              <div className='flex flex-col ml-3 flex-1 justify-center'>
                <div className='justify-between flex-row flex items-center'>
                  <span className='text-xl font-bold'>{pageAuthor.name}</span>
                  <span className='text-xs'>{pageAuthor.location}</span>
                </div>
                <span className='font-light text-xs mt-2'>{pageAuthor.bio}</span>
              </div>
            </div>
            <div className='mb-5'>
              {authenticated ? <span className='bg-sky-300 flex justify-center px-8 py-2 rounded-full text-neutral-50 font-bold cursor-pointer select-none' onClick={() => setCreatingBlog(!creatingBlog)}>{creatingBlog ? 'Cancel' : 'Create Blog'}</span> : (null)}
            </div>
            <div className='mt-2'>
              <div className=' bg-neutral-200 w-full h-64 rounded-2xl flex-col flex'>
                <span>Sagas</span>
                {pageAuthor?.sagas?.map((saga) => {
                  return (
                    <div key={saga.saga}>
                      <span>{saga.saga}</span>
                      <span> - </span>
                      <span>{getDateAge(saga.updated,DATE_TYPE.SAGA)}</span>
                    </div>
                  )
                })}
              </div>
              <div className=' bg-neutral-200 w-full h-64 rounded-2xl flex-col flex'>
                <span>Categories</span>
                  {pageAuthor?.tags?.map((tag) => {
                    return (
                      <span key={tag}>{tag}</span>
                    )
                  })}
              </div>
            </div>

          </div>
          <div>
            {authenticated ? (<span className='text-sky-500 underline cursor-pointer' onClick={() => authenticate(false)}>log out</span>) : (
              <div>
                <span className='text-sky-500 underline cursor-pointer' onClick={() => setLoggingIn(!loggingIn)}>log in</span>
                {loggingIn ? (
                  <div className='flex-col'>
                    <input value={email} onChange={(e) => setEmail(e.target.value)} className='border-sky-500 border-2 my-3 rounded-lg px-2 w-full'/>
                    <input value={password} type='password' onChange={(e) => setPassword(e.target.value)} className='border-sky-500 border-2 rounded-lg px-2 w-full' />
                    <div className='flex-row flex w-full justify-between'>
                      <span className='cursor-pointer' onClick={() => { setLoggingIn(false); setEmail('');  setPassword('')}}>cancel</span>
                      <span className='cursor-pointer' onClick={() => authenticate(true)}>confirm</span>
                    </div>
                  </div>
                ) : (<div></div>)}
              </div>
            )}
          </div>
        </div>
      </div>
    )
  }
}

interface BlogProps {
  blog: Blog
}

const BlogItem: React.FC<BlogProps> = ({blog}) => {
  return (
    <div className='flex-col flex mb-20'>
      <span className='text-xl font-semibold'>{blog.title}</span>
      <span className='text-sm mt-1 mb-3'>{getDateAge(blog.createdAt, DATE_TYPE.BLOG)}</span>
      <ReactMarkdown remarkPlugins={[remarkGfm]} linkTarget={'_blank'}>{blog.body}</ReactMarkdown>
    </div>
  )
}
