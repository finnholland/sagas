'use client'
import React, { useEffect, useRef, useState } from 'react';
import Image from 'next/image'
import "react-markdown-editor-lite/lib/index.css";
import dynamic from 'next/dynamic';
import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'
import 'github-markdown-css/github-markdown-light.css'
import Axios from 'axios';
import {API} from './constants'
import { getBlogAge } from './helpers';
import { Amplify, Auth } from 'aws-amplify';
import { userPool } from './constants';
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
  visible: boolean,
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

export default function Home() {
  const [preBlog, setPreBlog] = useState<PreBlog>({title: '', body: '', userId: '123abc', author: 'binn', visible: true, tags: [], saga: ''});
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


  useEffect(() => {
    Auth.currentAuthenticatedUser().then((res) => {
      setAuthenticated(res == undefined ? false : true)
    }).finally(() => setLoaded(true))
    // Axios.get(`${API}/getBlogs`).then(res => {
    //   console.log(res.data.items)
    //   last_evaluated_key = res.data.last_evaluated_key
    //   setBlogs(res.data.items)
    // })
  }, [])

  const nextPage = () => {
    const stringy = last_evaluated_key ? JSON.stringify(last_evaluated_key) : ''
    Axios.get(`${API}/getBlogs`, { params: { last_evaluated_key: stringy }}).then(res => {
      console.log(res.data.items)
      last_evaluated_key = res.data.last_evaluated_key
      console.log(last_evaluated_key)
    })
  }

  const createBlog = () => {
    console.table(preBlog)
    Axios.post(`${API}/createBlog`, preBlog ).then(res => {
      console.log(res)
    })
  }

  const authenticate = (login: boolean) => {
    if (login) {
      Auth.signIn(email, password).then((res) => {
        window.location.reload()
      })
    } else {
      Auth.signOut().then(() => window.location.reload()).catch(err => console.log('error signing out: ', err))
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
        <div className='w-1/2 h-full px-20 flex flex-col'>
          {authenticated ? <span onClick={() => setCreatingBlog(!creatingBlog)}>{creatingBlog ? 'cancel' : 'Create Blog'}</span> : (null)}
          {creatingBlog ? (<div>
            <div className='border-sky-300 border-2 rounded-2xl overflow-clip flex h-fit max-h-full'>
              <MdEditor
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
              <button className='bg-neutral-200 px-8 py-2 rounded-full text-neutral-400 font-bold'>cancel</button>
              <button onClick={() => createBlog()} disabled={preBlog.body == ''} className={`${preBlog.body == '' ? 'bg-sky-200' : 'bg-sky-300'} px-8 py-2 rounded-full text-neutral-50 font-bold`}>post</button>
            </div>
            <input type="text" placeholder='title' onChange={(e) => setPreBlog(prev => ({ ...prev, title: e.target.value }))} />
            <input type="text" placeholder='tags' onChange={(e) => setPreBlog(prev => ({ ...prev, tags: e.target.value.split(',') }))} />
            <input type="text" placeholder='saga' onChange={(e) => setPreBlog(prev => ({ ...prev, saga: e.target.value }))} />
          </div>) : (null)}
          {blogs?.map((item) => (
            <div className='markdown-body' key={item.id}>
              <span>{item.title}</span>
              <span>{getBlogAge(item.createdAt)}</span>
              <ReactMarkdown remarkPlugins={[remarkGfm]} linkTarget={'_blank'}>{item.body}</ReactMarkdown>
            </div>
          ))}
        </div>
        <div className='w-1/4 flex-3 h-full px-10 justify-between flex flex-col' >
          <div>
            <div className='flex flex-row mb-5'>
              <div>
                <Image className='rounded-2xl' src='/profile.jpg' alt='profile' width={100} height={100} />
              </div>
              <div className='flex flex-col ml-3 flex-1 justify-center'>
                <div className='justify-between flex-row flex items-center'>
                  <span className='text-xl font-bold'>Binn Hoola</span>
                  <span className='text-xs'>Australia - VIC</span>
                </div>
                <span className='font-light text-xs mt-2'>Welcome to my blog, here I post whatever I feel like but mostly just projects im working on :)</span>
              </div>
            </div>
            <div className=' bg-neutral-200 w-full h-64 rounded-2xl'>
              <span>Sagas</span>
            </div>
            <div className=' bg-neutral-200 w-full h-64 rounded-2xl'>
              <span>Categories</span>
            </div>
          </div>
          <div>
            {authenticated ? (
              <span className='text-blue-300 underline cursor-pointer' onClick={() => authenticate(false)}>log out</span>
            ) : (
                  <div>

                    <span className='text-blue-300 underline cursor-pointer' onClick={() => setLoggingIn(!loggingIn)}>log in</span>
                  {loggingIn ? (<div className='flex-col'>
                    <input value={email} onChange={(e) => setEmail(e.target.value)} className='border-blue-300 border-2 my-3 rounded-lg px-2 w-full'/>
                    <input value={password} onChange={(e) => setPassword(e.target.value)} className='border-blue-300 border-2 rounded-lg px-2 w-full' />
                    
                    <div className='flex-row flex w-full justify-between'>
                      <span className='cursor-pointer' onClick={() => { setLoggingIn(false); setEmail('');  setPassword('')}}>cancel</span>
                      <span className='cursor-pointer' onClick={() => authenticate(true)}>confirm</span>
                    </div>
                    </div>) : (<div></div>)}
                  </div>
            )}
          </div>

        </div>
      </div>
    )
  }
}
