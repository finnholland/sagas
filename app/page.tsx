'use client'
import React, { useEffect, useState } from 'react';
import Image from 'next/image'
import "react-markdown-editor-lite/lib/index.css";
import 'github-markdown-css/github-markdown-light.css'
import Axios from 'axios';
import {API, S3_URL} from './constants'
import {
  sortAndReduce, sortSagaFilters,
  sortTagFilters
} from './helpers/helpers';
import { Amplify, Auth } from 'aws-amplify';
import { userPool } from './constants';

import ArrowLeft from './assets/ArrowLeft';
import ArrowRight from './assets/ArrowRight';
import { Saga, User, PreBlog, BlogI, FilterBlog } from './types';
import ArrowDown from './assets/ArrowDown';
import InfiniteScroll from 'react-infinite-scroll-component';

import { Blog, MdEditor, SagaFilter, TagFilter } from '@/components';
import { saveDraft } from './helpers/api';

Amplify.configure({
  Auth: {
    region: userPool.REGION,
    userPoolId: userPool.USER_POOL_ID,
    userPoolWebClientId: userPool.USER_POOL_APP_CLIENT_ID
  }
})

let last_evaluated_key: string | null =  null
let last_evaluated_filter_key: string | null =  null

const PAGE_SIZE = 5
let tagsLength = 0;
let sagasLength = 0;
let blogsLength = 0;
let storageArray: BlogI[] = []
export default function Home() {
  const [currentUser, setCurrentUser] = useState<User>({location: '', bio: '', createdAt: '', id: '', name: '', sagas: [], tags: [], type: '', profileImage: '', draft: ''})
  const [pageAuthor, setPageAuthor] = useState<User>({location: '', bio: '', createdAt: '', id: '', name: '', sagas: [], tags: [], type: '', profileImage: ''})
  const [preBlog, setPreBlog] = useState<PreBlog>({title: '', body: '', userId: currentUser.id, author: currentUser.name, tags: [], saga: ''});
  const [originalBlog, setOriginalBlog] = useState<BlogI | undefined>(undefined);
  const [blogs, setBlogs] = useState<BlogI[]>([]);
  const [authenticated, setAuthenticated] = useState(false)
  const [loaded, setLoaded] = useState(false)
  const [creatingBlog, setCreatingBlog] = useState(false)
  const [isEditing, setIsEditing] = useState(false)

  const [loggingIn, setLoggingIn] = useState(false)
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')

  const [pageSagas, setPageSagas] = useState<Saga[]>([]);
  const [pageTags, setPageTags] = useState<string[]>([]);
  const [pageNumber, setPageNumber] = useState({tagPage: 1, sagaPage: 1, blogPage: 1})
  const [filterSaga, setFilterSaga] = useState('')
  const [filterTags, setFilterTags] = useState<string[]>([])
  const [filtering, setFiltering] = useState(false)



  useEffect(() => {
    Auth.currentAuthenticatedUser().then((res) => {
      if (res != undefined) {
        getCurrentUser(res.username)
        getBlogs(res.username);
      }
    }).finally(() => {
      setLoaded(true)
    }).catch(() => getBlogs(''))
    
    Axios.get(`${API}/getUser`, {params: {current: false}}).then(res => {
      setPageAuthor(res.data)
      setPageTags(sortTagFilters(res.data.tags).slice((0) * PAGE_SIZE, 1 * PAGE_SIZE));
      setPageSagas(sortSagaFilters(res.data.sagas).slice((0) * PAGE_SIZE, 1 * PAGE_SIZE));
      tagsLength = Math.ceil(res.data.tags.length/PAGE_SIZE);
      sagasLength = Math.ceil(res.data.sagas.length / PAGE_SIZE);
    });
  }, [])

  const getBlogs = (userId: string) => {
    const stringy = last_evaluated_key ? JSON.stringify(last_evaluated_key) : ''
    if (stringy != '') {
      Axios.get(`${API}/getBlogs`, { params: { last_evaluated_key: stringy, userId: userId } }).then(res => {
        const newBlogs = sortAndReduce([...blogs, ...res.data.items])
        setBlogs(newBlogs)
        blogsLength = Math.ceil(newBlogs.length / PAGE_SIZE);
        last_evaluated_key = res.data.last_evaluated_key
      })
    } else {
      Axios.get(`${API}/getBlogs`, { params: { userId: userId } }).then(res => {
        last_evaluated_key = res.data.last_evaluated_key
        let tempBlogs: BlogI[] = res.data.items
        tempBlogs = tempBlogs.filter(b => b.createdAt === "2023-10-18T22:06:07+00:00")
        setBlogs(tempBlogs)
        blogsLength = Math.ceil(tempBlogs.length / PAGE_SIZE);
      });
    }
  }

  const incrementPage = (type: string, increment: number) => {
    const tagIncrement = pageNumber.tagPage + increment;
    const sagaIncrement = pageNumber.sagaPage + increment;
    const blogIncrement = pageNumber.blogPage + increment;

    if (type === 'sagas' && sagaIncrement > 0 && sagaIncrement <= sagasLength) {
      let paginated = pageAuthor.sagas;
      const page = sagaIncrement;
      setPageNumber(prev => ({ ...prev, sagaPage: page }));
      setPageSagas(paginated.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE));
    } else if (type === 'tags' && tagIncrement > 0 && tagIncrement <= tagsLength){
      let paginated = pageAuthor.tags;
      setPageNumber(prev => ({ ...prev, tagPage: tagIncrement }));
      setPageTags(paginated.slice((tagIncrement - 1) * PAGE_SIZE, tagIncrement * PAGE_SIZE));
    } else if (type === 'blogs' && blogIncrement > 0 && blogIncrement <= tagsLength){
      let paginated = pageAuthor.tags;
      setPageNumber(prev => ({ ...prev, tagPage: blogIncrement }));
      setPageTags(paginated.slice((blogIncrement - 1) * PAGE_SIZE, blogIncrement * PAGE_SIZE));
    }
  }



  const getBlogsFiltered = () => {
    if (filterSaga === '' && filterTags.length === 0) {
      clearFilters();
      return
    }
    setFiltering(true);
    const filter = last_evaluated_filter_key ? JSON.stringify(last_evaluated_filter_key) : ''
    const params: FilterBlog = {
      tags: filterTags.length === 0 ? undefined : filterTags,
      saga: filterSaga === '' ? undefined : filterSaga
    }
    const stringy = params ? JSON.stringify(params) : ''
    if (filter != '') { 
      Axios.get(`${API}/getBlogsFiltered`, { params: { filters: stringy, last_evaluated_filter_key: filter }}).then(res => {
        storageArray = blogs;
        setBlogs(res.data.items);
        last_evaluated_filter_key = res.data.last_evaluated_filter_key
      })
    } else {
      Axios.get(`${API}/getBlogsFiltered`, { params: { filters: stringy }}).then(res => {
        storageArray = blogs;
        setBlogs(res.data.items);
        last_evaluated_filter_key = res.data.last_evaluated_filter_key
      })
    }

  }

  const clearFilters = () => {
    let filtered = blogs;
    setFilterSaga('');
    setFilterTags([]);
    setFiltering(false);
    storageArray = storageArray.concat(filtered);
    storageArray = sortAndReduce(storageArray)
    setBlogs(storageArray);
  }

  const getCurrentUser = (id: string) => {
    setAuthenticated(true);
    Axios.get(`${API}/getUser`, {params: {id: id, self: true}}).then(res => {
      setCurrentUser(res.data)
      setPreBlog(prev => ({ ...prev, author: res.data.name, userId: res.data.id, body: res.data.draft || '' }))
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

  const startCreatingBlog = () => {
    setCreatingBlog(!creatingBlog);
    setPreBlog(prev => ({ ...prev, body: currentUser.draft || '' }))
  }

  const blogItem = blogs?.map((item) => (
    <Blog key={item.id} blog={item} owned={item.userId === currentUser.id} setPreBlog={setPreBlog} preBlog={preBlog} setBlogs={setBlogs}
      blogs={blogs} pageAuthor={pageAuthor} currentUser={currentUser} setOriginalBlog={setOriginalBlog} creatingBlog={creatingBlog} setCreatingBlog={setCreatingBlog}/>
  ))

  if (!loaded) {
    return <div />
  } else {
    return (
      <div className='px-10 w-3/5 flex flex-grow-0 h-full flex-row justify-between items-center'>
        <div className='w-full h-full flex flex-col py-10 no-scrollbar'>
          {creatingBlog ? (
            <MdEditor preBlog={preBlog} setPreBlog={setPreBlog} isEditing={isEditing} setIsEditing={setIsEditing}
              currentUser={currentUser} setCreatingBlog={setCreatingBlog} setCurrentUser={setCurrentUser}
              pageAuthor={pageAuthor} setBlogs={setBlogs} blogs={blogs} originalBlog={originalBlog} setOriginalBlog={setOriginalBlog}/>
          ) : (null)}
          <InfiniteScroll
            dataLength={blogs?.length || 0}
            next={() => console.log('loading new blogs')}
            hasMore={(last_evaluated_key !== null && !filtering) || (last_evaluated_filter_key !== null && filtering)}
            endMessage={<p className='text-neutral-400 text-center select-none'>no more blogs :(</p>}
            loader={!loaded ?'loading...' : ''}
            
            className='overflow-visible mb-10'>
            {blogItem}
            <div onClick={() => getBlogs(currentUser.id)} className={`cursor-pointer flex-row flex justify-center items-center ${last_evaluated_key === null || filtering ? 'hidden' : ''}`}>
              <span className='mr-2 text-sky-300'>load more</span>
              <ArrowDown className='cursor-pointer' height={25} stroke='#6ED0D7'/>
            </div>
            <div className={`flex-row flex justify-center items-center ${last_evaluated_filter_key === null || !filtering ? 'hidden' : ''}`}>
              <ArrowLeft className='cursor-pointer' onClick={() => incrementPage('blogs', -1)} height={25} stroke={pageNumber.blogPage === 1 ? '#BEBEBE' : '#6ED0D7' } />
              <span className='mx-5'>{pageNumber.blogPage} of {blogsLength}</span>
              <ArrowRight className='cursor-pointer' onClick={() => incrementPage('blogs', 1)} height={25} stroke={pageNumber.blogPage === blogsLength ? '#BEBEBE' : '#6ED0D7' }/>
            </div>
          </InfiniteScroll>

        </div>
        <div className='w-1/4 flex-3 px-10 justify-between flex flex-col fixed right-0 sides top-0 h-fit' >
          <div className='mb-5'>
            <div className='flex flex-row mb-5'>
              <div className='bg-neutral-50'>
                {pageAuthor.profileImage === '' ? (null) : (
                  <Image className='rounded-2xl m-0' src={S3_URL+pageAuthor.profileImage} alt='profile' width={100} height={100} />
                )}
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
              {authenticated ? <span className='bg-sky-300 flex justify-center px-8 py-2 rounded-full text-neutral-50 font-bold cursor-pointer select-none' onClick={() => startCreatingBlog()}>{creatingBlog ? 'Cancel' : 'Create Blog'}</span> : (null)}
            </div>
            <div className='mt-2'>
              <div className={`bg-neutral-100 w-full rounded-2xl flex-col flex items-center justify-between pb-4 mb-8 ${sagasLength > 1 ? 'h-72' : ''}`}>
                <div className='justify-between w-full items-center flex flex-col px-5'>
                  <div className='border-b-2 border-b-white w-full py-3 flex mb-3'>
                    <span className='font-bold text-sky-300'>Sagas</span>
                  </div>
                  {sagasLength > 0 ? (
                    <div className='px-3 w-full'>
                      {sortSagaFilters(pageSagas).map((saga) => (
                        <SagaFilter key={saga.saga} name={saga.saga} updated={saga.updated} filterSaga={filterSaga} setFilterSaga={setFilterSaga} />
                      ))}
                    </div>
                    ) : (<span className='mb-3 w-full'>no sagas yet!</span>)
                  }
                </div>
                <div className='flex-row flex w-1/3 justify-between items-center'>
                  
                  <ArrowLeft className='cursor-pointer' onClick={() => incrementPage('sagas', -1)} height={25} stroke={pageNumber.sagaPage === 1 ? '#BEBEBE' : '#6ED0D7'} />
                  <span>{pageNumber.sagaPage} of {sagasLength}</span>
                  <ArrowRight className='cursor-pointer' onClick={() => incrementPage('sagas', 1)} height={25} stroke={pageNumber.sagaPage === sagasLength ? '#BEBEBE' : '#6ED0D7' }/>
                </div>

              </div>
              <div className={`bg-neutral-100 w-full rounded-2xl flex-col flex items-center justify-between pb-4 ${tagsLength > 1 ? 'h-72' : ''}`}>
                <div className='justify-between w-full items-center flex flex-col px-5'>
                  <div className='border-b-2 border-b-white w-full py-3 flex mb-3'>
                    <span className='font-bold text-sky-300'>Tags</span>
                  </div>
                  {tagsLength > 0 ? (
                    <div className='px-3 w-full'>
                      {sortTagFilters(pageTags).map((tag) => (
                        <TagFilter key={tag} name={tag} filterTags={filterTags} setFilterTags={setFilterTags}/>
                      ))}
                    </div>
                    ) : (<span className='mb-3 w-full'>no tags yet!</span>)
                  }
                </div>
                <div className='flex-row flex w-1/3 justify-between items-center'>
                  <ArrowLeft className='cursor-pointer' onClick={() => incrementPage('tags', -1)} height={25} stroke={pageNumber.tagPage === 1 ? '#BEBEBE' : '#6ED0D7' } />
                  <span>{pageNumber.tagPage} of {tagsLength}</span>
                  <ArrowRight className='cursor-pointer' onClick={() => incrementPage('tags', 1)} height={25} stroke={pageNumber.tagPage === tagsLength ? '#BEBEBE' : '#6ED0D7' }/>
                </div>

              </div>
              <div className='flex-row flex w-full justify-center mt-5'>
                <span className='bg-sky-300 flex justify-center px-8 py-2 rounded-full text-neutral-50 font-bold cursor-pointer select-none mr-5'
                  onClick={() => getBlogsFiltered()}>
                  Apply
                </span>
                <span className={`${filterSaga === '' && filterTags.length === 0 ? 'bg-sky-200' : 'bg-sky-300'}  flex justify-center px-8 py-2 rounded-full text-neutral-50 font-bold cursor-pointer select-none ml-5`}
                  onClick={() => clearFilters()}>
                  Clear
                </span>
              </div>
            </div>

          </div>
          <div>
            {authenticated ? (<span className='text-sky-500 underline cursor-pointer' onClick={() => authenticate(false)}>log out</span>) : (
              <div>
                <span className='text-sky-500 underline cursor-pointer' onClick={() => setLoggingIn(!loggingIn)}>log in</span>
                {loggingIn ? (
                  <div className='flex-col'>
                    <input value={email} onChange={(e) => setEmail(e.target.value)} className='border-sky-500 border-1 my-3 rounded-full px-2 w-full'/>
                    <input value={password} type='password' onChange={(e) => setPassword(e.target.value)} className='border-sky-500 border-1 rounded-full px-2 w-full' />
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
