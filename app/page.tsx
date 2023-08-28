'use client'
import React, { useState } from 'react';
import Image from 'next/image'
import Editor from 'react-markdown-editor-lite';
import ReactMarkdown from 'react-markdown';
import dynamic from 'next/dynamic';

const MdEditor = dynamic(() => import('react-markdown-editor-lite'), {
  ssr: false,
});

export default function Home() {
  const mdEditor = React.createRef<Editor>();
  const [value, setValue] = useState("xxx");
  
  const handleEditorChange = ({ html, text }: { html: string, text: string }) => {
    const newValue = text.replace(/\d/g, "");
    console.log(newValue);
    setValue(newValue);
  };

  return (
    // <div className=' px-10 py-10 flex-1 flex h-full flex-row justify-between items-center'>
    //   <div className='bg-blue-400 w-1/4 flex-3 text-center h-full px-10'>
    //     <div className='bg-blue-300 w-full h-full'>

    //     </div>
    //   </div>
    //   <div className='bg-violet-400 w-1/2 text-center h-full px-20'>
    //     <div className='bg-violet-300 w-full h-full'>
    //       <MdEditor
    //         style={{ height: "500px" }}
    //         // eslint-disable-next-line react/no-children-prop
    //         renderHTML={(text) => <ReactMarkdown children={text} />}
    //       />
    //     </div>
    //   </div>
    //   <div className='w-1/4 flex-3 h-full px-10' >
    //     <div>
    //       <div className='flex flex-row mb-5'>
    //         <div>
    //           <Image className='rounded-2xl' src='/profile.jpg' alt='profile' width={100} height={100} />
    //         </div>
    //         <div className='flex flex-col ml-3 flex-1 justify-center'>
    //           <div className='justify-between flex-row flex items-center'>
    //             <span className='text-xl font-bold'>Binn Hoola</span>
    //             <span className='text-xs'>Australia - VIC</span>
    //           </div>
    //           <span className='font-light text-xs mt-2'>Welcome to my blog, here I post whatever I feel like but mostly just projects im working on :)</span>
    //         </div>
    //       </div>
    //     </div>

    //     <div className=' bg-neutral-200 w-full h-64 rounded-2xl'>
    //       <span>Sagas</span>
    //     </div>
    //     <div className=' bg-neutral-200 w-full h-64 rounded-2xl'>
    //       <div>
    //         <span>Categories</span>
    //       </div>
    //     </div>
    //   </div>
    // </div>
              <MdEditor
            style={{ height: "500px" }}
            // eslint-disable-next-line react/no-children-prop
            renderHTML={(text) => <ReactMarkdown children={text} />}
          />
  )
}
