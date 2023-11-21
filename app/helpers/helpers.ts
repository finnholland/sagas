import moment from "moment";
import { DATE_TYPE, ENV, REGION, S3_BUCKET, S3_URL } from "../constants";
import { S3Client, PutObjectCommand } from "@aws-sdk/client-s3";
import { BlogI, PreBlog, SagaI } from "../types";
import { Dispatch, SetStateAction, useEffect } from "react";
import { editBlogI } from "./interface";
import { v4 as uuidv4 } from 'uuid';
import { likeItem, saveDraft } from "./api";

export const getDateAge = (createdAt: string, type: string) => {
  const now = moment(new Date()).utcOffset('+0000'); //todays date
  const end = moment(createdAt);
  const MINUTE = Math.round(moment.duration(now.diff(end)).asMinutes());
  const HOUR = Math.round(moment.duration(now.diff(end)).asHours());
  const DAY = Math.round(moment.duration(now.diff(end)).asDays());
  const WEEK = Math.round(moment.duration(now.diff(end)).asWeeks());
  const MONTH = Math.round(moment.duration(now.diff(end)).asMonths());
  const YEAR = Math.round(moment.duration(now.diff(end)).asYears());


  let ageString = ''
  if (YEAR >= 1) {
    ageString = YEAR.toString() + ( YEAR >= 2 ? ' years' : ' year') + ' ago'
  } else if (MONTH >= 1) {
    ageString = MONTH.toString() + (MONTH >= 2 ? ' months' : ' month') + ' ago';
  } else if (WEEK >= 1) {
    ageString = WEEK.toString() + (WEEK >= 2 ? ' weeks' : ' week') + ' ago'; // minutes -> hours
  } else if (DAY >= 1) {
    ageString = DAY.toString() + (DAY >= 2 ? ' days' : ' day') + ' ago'; // minutes -> hours -> days
  } else if (HOUR >= 1) {
    ageString = HOUR.toString() + (HOUR >= 2 ? ' hours' : ' hour') + ' ago';
  } else if (MINUTE >= 1) {
    ageString = MINUTE.toString() + (MINUTE >= 2 ? ' minutes' : ' minute') + ' ago'
  } else {
    ageString = 'just now'
  }

  if (type === DATE_TYPE.SAGA) {
    return ageString;
  } else if (type === DATE_TYPE.EDIT) {
    return 'edited - ' + ageString;
  } else {
    return moment(createdAt).format("YYYY/MM/DD") + ' - ' + ageString;
  }
}


export const uploadFile = async (body: File) => {
  const s3Client = new S3Client({
    region: REGION, credentials: {
      accessKeyId: process.env.NEXT_PUBLIC_ACCESS_KEY || '',
      secretAccessKey: process.env.NEXT_PUBLIC_SECRET_KEY || ''
  } });

  const params = {
    Bucket: S3_BUCKET,
    Key: ENV+'/'+body.name,
    Body: body,
    ContentType: "image/jpeg",
  };

  try {
    const command = new PutObjectCommand(params);
    await s3Client.send(command);

    return S3_URL + body.name;
  } catch (error) {
    console.error("Error uploading file:", error);
    throw error;
  }
};


export const dataURLtoFile = (dataurl: string, filename: string) => {
  const arr = dataurl.split(',');
  const mimeGroup = arr[0].match(/data:(.*?);/);
  let mime = '';
  if (mimeGroup && mimeGroup[1])
    mime = mimeGroup[1];
  const bstr = atob(arr[arr.length - 1]);
  let n = bstr.length;
  const u8arr = new Uint8Array(n);

  while (n--) {
    u8arr[n] = bstr.charCodeAt(n);
  }
  return new File([u8arr], filename, { type: mime });
}

export const isEmpty = (str: string): boolean => {
  return str.trim() === "";
}

export const sortSagaFilters = (filters: SagaI[]): SagaI[] => {
  const sorted = filters.sort((a, b) => moment(b.updated, 'YYYY-MM-DDT00:00:00').diff(moment(a.updated, 'YYYY-MM-DDT00:00:00')))
  return sorted
}
export const sortTagFilters = (filters: string[]): string[] => {
  return filters.sort();
}

interface ToggleTagProps {
  name: string
  filterTags: string[]
  setFilterTags: Dispatch<SetStateAction<string[]>>
}
interface ToggleSagaProps {
  name: string
  filterSaga: string
  setFilterSaga: Dispatch<SetStateAction<string>>
}
export const toggleTagFilter = ({ name, filterTags, setFilterTags }: ToggleTagProps) => {
  const index = filterTags.indexOf(name);
  if (index >= 0) {
    setFilterTags(filterTags.filter(f => f !== name))
  } else {
    setFilterTags([...filterTags, name])
  }
}

export const toggleSagaFilter = ({ name, filterSaga, setFilterSaga }: ToggleSagaProps) => {
  if (filterSaga === name) {
    setFilterSaga('')
  } else {
    setFilterSaga(name)
  }
}

interface AddOrRemoveTagProps {
  tag: string
  preBlog: PreBlog
  setPreBlog: Dispatch<SetStateAction<PreBlog>>
}
export const addOrRemoveTag = ({ tag, preBlog, setPreBlog }: AddOrRemoveTagProps) => {
  const index = preBlog.tags.indexOf(tag);
  if (index >= 0) {
    setPreBlog(prev => ({ ...prev, tags: preBlog.tags.filter(f => f !== tag) }))
  } else {
    setPreBlog(prev => ({ ...prev, tags: [...prev.tags, tag] }))
  }
}

export const sortAndReduce = (array: BlogI[]): BlogI[] => {
  let blogs: BlogI[] = array.reduce((unique: BlogI[], o) => {
    if (!unique.some(u => u.id === o.id)) {
      unique.push(o);
    }
    return unique;
  }, []);
  blogs.sort((a, b) => moment(b.createdAt, 'YYYY-MM-DDT00:00:00').diff(moment(a.createdAt, 'YYYY-MM-DDT00:00:00')))

  return blogs
}


export const editBlog = (props: editBlogI) => {
  if (props.creatingBlog) {
    saveDraft(props.currentUser, props.preBlog.body, props.jwt).then(res => {
      props.setPreBlog({ title: '', body: '', userId: props.currentUser.id, author: props.currentUser.name, tags: [], saga: '' });
      props.setCreatingBlog(false);
    })
  }
  const blog: PreBlog = {
    title: props.blog.title,
    body: props.blog.body,
    userId: props.blog.userId,
    author: props.blog.author,
    tags: props.blog.tags,
    saga: props.blog.saga
  }
  props.setPreBlog(blog);
}

export const handleImageUpload = (file: File) => {
  let uuid = uuidv4();
  return new Promise(resolve => {
    const reader = new FileReader();
    reader.onload = data => {
      if (data.target && data.target.result) {
        if (typeof data.target.result === 'string') {
          uploadFile(dataURLtoFile(data.target.result, 'images/' + uuid)).then(res => resolve(res))
        }
      }
    };
    reader.readAsDataURL(file);
  });
};

export const handleText = (text: string): string => {
  console.log(text)
  const matches = text.match(/<iframe\s+width="(\d+)"\s+height="(\d+)"/i);
  if (matches && matches.length === 3) {
    const width = matches[1]; // Extracted width value
    const height = matches[2];
    text = text.replace(matches[0], `<iframe style="aspectRatio:${width}/${height}"`);
    text = text.replace(/allow.*" /, "");
    text = text.replace(/frameborder.*" /, "");
  }
  return text;
}

export const colourConverter = (image: string): {fill: string, stroke: string, tw: string} => {
  const replaced = image.replace('.png', '')

  const blue = ['cow', 'chicken', 'tiger']
  const sky = ['cat', 'bear', 'polarbear']
  const green = ['pig', 'dog', 'rabbit']
  const pink = ['koala', 'frog', 'hamster']

  if (blue.includes(replaced)) {
    return { fill: '#6485DC', stroke: '#3654A6', tw: 'text-blue-500'}
  } else if (sky.includes(replaced)) {
    return { fill: '#7DD3FC', stroke: '#3681A6', tw: 'text-sky-300' }
  } else if (green.includes(replaced)) {
    return { fill: '#75EDA5', stroke: '#36A662', tw: 'text-green-300' }
  } else if (pink.includes(replaced)) {
    return { fill: '#F1A2E4', stroke: '#A63694', tw: 'text-pink-300' }
  }
  return { fill: '#fff', stroke: '#333', tw: 'text-neutral-50' }
}

export const useAutosizeTextArea = (textAreaRef: HTMLTextAreaElement | null, value: string) => {
  useEffect(() => {
    if (textAreaRef) {
      // We need to reset the height momentarily to get the correct scrollHeight for the textarea
      textAreaRef.style.height = "0px";
      const scrollHeight = textAreaRef.scrollHeight;

      // We then set the height directly, outside of the render loop
      // Trying to set this with state or a ref will product an incorrect value.
      textAreaRef.style.height = scrollHeight + "px";
    }
  }, [textAreaRef, value]);
};

// generates a random number of shares based on time of post to simulate engagement until i figure out a good way other than clicks
export const getShares = (createdAt: string) => {
  const now = moment(new Date()).utcOffset('+0000'); //todays date
  const end = moment(createdAt);
  const HOUR = Math.round(moment.duration(now.diff(end)).asHours());

  if (HOUR < 48) {
    return 0;
  }
  const random = Math.sin(2.8);
  const shares = Math.floor(HOUR * random / 100) ;
  return Math.abs(shares)
}

interface LikeBlogI {
  userId: string
  blog: BlogI
  setBlog: Dispatch<SetStateAction<BlogI>>
  liked: boolean
}
export const likeBlogHelper = ({ userId, blog, setBlog, liked }: LikeBlogI) => {
  likeItem(userId, blog.id, blog.createdAt, blog.likes, liked).then(() => {
    if (liked) {
      let blogT = blog;
      blogT.likes = blogT.likes.filter(id => id !== userId)
      setBlog({ ...blogT })
    } else {
      let blogT = blog;
      blogT.likes.push(userId)
      setBlog({ ...blogT })
    }
  })
}