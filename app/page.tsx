'use client'
import React, { Dispatch, SetStateAction, useEffect, useState } from 'react';
import Image from 'next/image'
import "react-markdown-editor-lite/lib/index.css";
import dynamic from 'next/dynamic';
import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'
import 'github-markdown-css/github-markdown-light.css'
import Axios from 'axios';
import {API, DATE_TYPE, ENV, S3_URL} from './constants'
import { addOrRemoveTag, dataURLtoFile, getDateAge, isEmpty, sortAndReduce, sortSagaFilters, sortTagFilters, toggleSagaFilter, toggleTagFilter, uploadFile } from './helpers';
import { Amplify, Auth } from 'aws-amplify';
import { userPool } from './constants';
import { v4 as uuidv4 } from 'uuid';
import ArrowLeft from './assets/ArrowLeft';
import ArrowRight from './assets/ArrowRight';
import Plus from './assets/Plus';
import Remove from './assets/Remove';
import { Saga, User, PreBlog, Blog, FilterBlog } from './types';
import ArrowDown from './assets/ArrowDown';
import InfiniteScroll from 'react-infinite-scroll-component';
import Modal from 'react-modal';
import MoreDots from './assets/MoreDots';

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
let last_evaluated_key: string | null =  null
let last_evaluated_filter_key: string | null =  null

const PAGE_SIZE = 5
let tagsLength = 0;
let sagasLength = 0;
let blogsLength = 0;
let storageArray: Blog[] = []
export default function Home() {
  const [currentUser, setCurrentUser] = useState<User>({location: '', bio: '', createdAt: '', id: '', name: '', sagas: [], tags: [], type: '', profileImage: ''})
  const [pageAuthor, setPageAuthor] = useState<User>({location: '', bio: '', createdAt: '', id: '', name: '', sagas: [], tags: [], type: '', profileImage: ''})
  const [preBlog, setPreBlog] = useState<PreBlog>({title: '', body: '', userId: currentUser.id, author: currentUser.name, tags: [], saga: ''});
  const [blogs, setBlogs] = useState<Blog[]>([]);
  const [authenticated, setAuthenticated] = useState(false)
  const [loaded, setLoaded] = useState(false)
  const [creatingBlog, setCreatingBlog] = useState(false)
  const [isOpen, setIsOpen] = useState(false)
  const [loggingIn, setLoggingIn] = useState(false)
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [tag, setTag] = useState('')

  const [pageSagas, setPageSagas] = useState<Saga[]>([]);
  const [pageTags, setPageTags] = useState<string[]>([]);
  const [pageNumber, setPageNumber] = useState({tagPage: 1, sagaPage: 1, blogPage: 1})
  const [filterSaga, setFilterSaga] = useState('')
  const [filterTags, setFilterTags] = useState<string[]>([])
  const [filtering, setFiltering] = useState(false)

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
          if (typeof data.target.result === 'string') {
            uploadFile(dataURLtoFile(data.target.result, ENV+'/images/'+uuid)).then(res => resolve(res))
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
    getBlogs();
    Axios.get(`${API}/getUser`).then(res => {
      setPageAuthor(res.data)
      setPageTags(sortTagFilters(res.data.tags).slice((0) * PAGE_SIZE, 1 * PAGE_SIZE));
      setPageSagas(sortSagaFilters(res.data.sagas).slice((0) * PAGE_SIZE, 1 * PAGE_SIZE));
      tagsLength = Math.ceil(res.data.tags.length/PAGE_SIZE);
      sagasLength = Math.ceil(res.data.sagas.length / PAGE_SIZE);
    });
  }, [])

  const getBlogs = () => {
    const stringy = last_evaluated_key ? JSON.stringify(last_evaluated_key) : ''
    if (stringy != '') {
      Axios.get(`${API}/getBlogs`, { params: { last_evaluated_key: stringy } }).then(res => {
        const newBlogs = sortAndReduce([...blogs, ...res.data.items])
        setBlogs(newBlogs)
        blogsLength = Math.ceil(newBlogs.length / PAGE_SIZE);
        last_evaluated_key = res.data.last_evaluated_key
      })
    } else {
      Axios.get(`${API}/getBlogs`).then(res => {
        last_evaluated_key = res.data.last_evaluated_key
        setBlogs(res.data.items)
        blogsLength = Math.ceil(res.data.items.length / PAGE_SIZE);
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

  const createBlog = () => {
    setIsOpen(false);

    let newSagas = currentUser.sagas || [];
    if (!isEmpty(preBlog.saga)) {
      const index = newSagas.findIndex(t => t.saga.toLowerCase() === preBlog.saga.toLowerCase());
      if (index >= 0) {
        newSagas[index].updated = '';
      } else if (index === -1) {
        newSagas.push({saga: preBlog.saga, updated: ''})
      }
    }

    const newTags = preBlog.tags.filter((str: string) => !isEmpty(str));
    let combinedTags = Array.from(new Set(currentUser.tags.concat(newTags)));
    if (combinedTags === currentUser.tags) {
      combinedTags = []
    }

    Axios.post(`${API}/createBlog`, { ...preBlog, userTags: combinedTags, userSagas: newSagas, createdAt: currentUser.createdAt }).then(res => {
      setPreBlog({ title: '', body: '', userId: currentUser.id, author: currentUser.name, tags: [], saga: '' });
      setCreatingBlog(false);
    })
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
    Axios.get(`${API}/getUser`, {params: {id: id}}).then(res => {
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

  const blogItem = blogs?.map((item) => (
    <BlogItem key={item.id} blog={item} owned={item.userId === currentUser.id} />
  ))

  if (!loaded) {
    return <div />
  } else {
    return (
      <div className='px-10 w-2/5 flex-grow-0 h-full flex-row justify-between items-center'>
        <div className='w-1/4 h-screen flex-3 px-10 justify-end flex flex-col fixed left-0 py-10 top-0'>
          <div>
            {authenticated ? (<span className='text-sky-500 underline cursor-pointer' onClick={() => authenticate(false)}>log out</span>) : (
              <div>
                <span className='text-sky-500 underline cursor-pointer' onClick={() => setLoggingIn(!loggingIn)}>log in</span>
                {loggingIn ? (
                  <div className='flex-col'>
                    <input value={email} onChange={(e) => setEmail(e.target.value)} className='border-sky-500 border-1 my-2 h-10 rounded-2xl px-4 w-full'/>
                    <input value={password} type='password' onChange={(e) => setPassword(e.target.value)} className='border-sky-500 border-1 rounded-2xl px-4 h-10 w-full mb-2' />
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
        <div className='w-full h-full flex flex-col py-10 no-scrollbar'>
          {creatingBlog ? (<div className='mb-10'>
            <div className='border-sky-300 border-2 rounded-2xl overflow-clip flex h-fit max-h-full mb-5'>
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
              <button onClick={() => setIsOpen(true)} disabled={preBlog.body === ''} className={`${preBlog.body === '' ? 'bg-sky-200' : 'bg-sky-300'} px-8 py-2 rounded-full text-neutral-50 font-bold`}>confirm</button>
            </div>
            <Modal isOpen={isOpen} onRequestClose={() => setIsOpen(false)} ariaHideApp={false}
              className='border-0 left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-1/3 fixed'>
              <div className='flex-col flex w-full bg-white p-5 shadow-md rounded-2xl'>
                <div className='w-full py-1 flex'>
                  <span className='font-bold text-sky-300 mr-3 w-10'>Title</span>
                  <input className='border-b-neutral-200 border-b-2 focus:border-sky-300 focus:outline-none' type="text" placeholder='title' onChange={(e) => setPreBlog(prev => ({ ...prev, title: e.target.value }))} />
                </div>
                <div className='w-full flex my-6'>
                  <span className='font-bold text-sky-300 mr-3 w-10'>Saga</span>
                  <input className='border-b-neutral-200 border-b-2 focus:border-sky-300 focus:outline-none' type="text" placeholder='saga' onChange={(e) => setPreBlog(prev => ({ ...prev, saga: e.target.value }))} />
                </div>
                <div className='w-full flex'>
                  <span className='font-bold text-sky-300 mr-3 w-10'>Tags</span>
                  <div className='flex flex-row items-center'>
                    <input className='border-b-neutral-200 border-b-2 focus:border-sky-300 focus:outline-none mr-3' type="text" placeholder='tag' onChange={(e) => setTag(e.target.value)} />
                    <Plus onClick={() => { setPreBlog(prev => ({ ...prev, tags: [...prev.tags, tag] })); setTag('') }} width={20}/> 
                  </div>
                </div>
                <span className={`${preBlog.tags.length>0 ? '' : 'hidden'} text-sm text-neutral-600 mt-5 mb-1`}>current tags</span>
                <div className={`${preBlog.tags.length > 0 ? '' : 'hidden'} flex flex-row w-full flex-wrap mb-3`}>
                  {preBlog.tags.map((tag) => (
                    <Bubble key={tag} name={tag} preBlog={preBlog} type='tag' setPreBlog={setPreBlog}/>
                  ))}
                </div>
                <span className='text-sm text-neutral-600 mt-5 mb-1'>previous tags</span>
                <div className='flex flex-row w-full flex-wrap mb-3'>
                  {pageAuthor.tags.map((tag) => (
                    <div key={tag} onClick={() => addOrRemoveTag({ tag: tag, preBlog: preBlog, setPreBlog: setPreBlog })}
                      className={`flex-row flex items-center mr-3 mb-2 px-3 py-1 border-1 rounded-full border-sky-300 cursor-pointer select-none ${preBlog.tags.includes(tag) ? 'hidden' : ''}`}>
                      <span className='mr-1 text-neutral-500'>{tag}</span>
                      <span><Plus width={15} /></span>
                    </div>
                  ))}
                </div>
                <div className='flex-row flex justify-between'>
                  <button onClick={() => setIsOpen(false) }
                    className='bg-neutral-200 px-8 py-2 rounded-full text-neutral-400 font-bold'>back</button>
                  <button onClick={() => createBlog()} disabled={preBlog.title === '' || preBlog.saga === ''}
                    className={`${preBlog.title === '' || preBlog.saga === '' ? 'bg-sky-200' : 'bg-sky-300'} px-8 py-2 rounded-full text-neutral-50 font-bold`}>create</button>
                </div>
              </div>
            </Modal>

          </div>) : (null)}
          <InfiniteScroll
            dataLength={blogs.length}
            next={() => console.log('loading new blogs')}
            hasMore={(last_evaluated_key !== null && !filtering) || (last_evaluated_filter_key !== null && filtering)}
            endMessage={<p className='text-neutral-400 text-center select-none'>no more blogs :(</p>}
            loader={null}
            className='overflow-visible mb-10'>
            {blogItem}
            <div onClick={() => getBlogs()} className={`cursor-pointer flex-row flex justify-center items-center ${last_evaluated_key === null || filtering ? 'hidden' : ''}`}>
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
        <div className='w-1/4 flex-3 px-10 justify-between flex flex-col fixed right-0 sides top-0 h-screen py-10' >
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
              {authenticated ? <span className='bg-sky-300 flex justify-center px-8 py-2 rounded-full text-neutral-50 font-bold cursor-pointer select-none' onClick={() => setCreatingBlog(!creatingBlog)}>{creatingBlog ? 'Cancel' : 'Create Blog'}</span> : (null)}
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
        </div>
      </div>
    )
  }
}

interface BlogProps {
  blog: Blog
  owned: boolean
}

const BlogItem: React.FC<BlogProps> = ({ blog, owned }) => {
  
  return (
    <div className='flex-col flex mb-20'>
      <div className='flex-row flex justify-between items-center'>
      <div className='flex-col flex justify-between'>
        <span className='text-xl font-semibold'>{blog.title}</span>
        <span className='text-sm mt-1'>{getDateAge(blog.createdAt, DATE_TYPE.BLOG)}</span>
        </div>
        <div className='flex-row flex items-center'>
          <Bubble name={blog.saga} type='saga' />
          {owned ? (<MoreDots className='ml-3 cursor-pointer' width={20} />) : (null)}
        </div>
      </div>

      <ReactMarkdown className='markdown' remarkPlugins={[remarkGfm]} linkTarget={'_blank'}>{blog.body}</ReactMarkdown>
      <div className='flex-row flex flex-wrap'>
        {blog.tags.map((tag) => {
          return <Bubble key={tag} name={tag} type='tag'/>
        })}
      </div>
    </div>
  )
}

interface SagaProps {
  name: string,
  updated: string,
  filterSaga: string
  setFilterSaga: Dispatch<SetStateAction<string>>
}
const SagaFilter: React.FC<SagaProps> = ({ name, updated, filterSaga, setFilterSaga }) => {
  return (
    <div onClick={() => toggleSagaFilter({name, filterSaga, setFilterSaga})} className='flex-row flex w-full justify-between my-2 cursor-pointer'>
      <span className={`font-medium ${filterSaga===name ? 'text-sky-300' : ''}`}>{name}</span>
      <span className={`font-medium ${filterSaga===name ? 'text-sky-300' : ''}`}>{getDateAge(updated,DATE_TYPE.SAGA)}</span>
    </div>
  )
}

interface TagProps {
  name: string,
  filterTags: string[]
  setFilterTags: Dispatch<SetStateAction<string[]>>
}
const TagFilter: React.FC<TagProps> = ({ name, filterTags, setFilterTags }) => {
  return (
    <div onClick={() => toggleTagFilter({ name, filterTags, setFilterTags })} className='flex-row flex w-full justify-between my-2 cursor-pointer'>
      <span className={`font-medium ${filterTags.includes(name) ? 'text-sky-300' : ''}`}>{name}</span>
      {filterTags.includes(name) ? <Remove width={15} /> : <Plus width={15} />}
    </div>
  )
}

interface Bubble {
  name: string
  type: string
  preBlog?: PreBlog,
  setPreBlog?: Dispatch<SetStateAction<PreBlog>>
}
const Bubble: React.FC<Bubble> = ({ name, type, preBlog, setPreBlog }) => {
  if (preBlog && setPreBlog) {
    return (
      <div onClick={() => addOrRemoveTag({ tag: name, preBlog: preBlog, setPreBlog: setPreBlog })}
        className={`flex-row flex items-center mr-3 mb-2 px-3 py-1 border-1 rounded-full border-sky-300 cursor-pointer select-none ${preBlog.tags.includes(name) ? 'bg-sky-50' : ''}`}>
        <span className='mr-1 text-sky-300'>{name}</span>
        <span>{preBlog.tags.includes(name) ? <Remove width={15} /> : <Plus width={15} />}</span>
      </div>
    )
  } else if (type === 'tag') {
    return (
        <div className='flex-row flex items-center mr-3 mb-2 px-3 py-1 border-1 rounded-full border-sky-300 select-none bg-sky-50'>
          <span className='mr-1 text-sky-300'>{name}</span>
        </div>
    )
  }
  return (
      <div className='flex-row flex items-center px-3 py-1 border-1 rounded-full border-fuchsia-300 select-none bg-fuchsia-50'>
        <span className='mr-1 text-fuchsia-300'>{name}</span>
      </div>
  )
}
