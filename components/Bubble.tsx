import {Plus, Remove } from "@/app/assets"
import { addOrRemoveTag } from "@/app/helpers/helpers"
import { PreBlog } from "@/app/types"
import { Dispatch, SetStateAction } from "react"

interface Bubble {
  name: string
  type: string
  preBlog?: PreBlog,
  setPreBlog?: Dispatch<SetStateAction<PreBlog>>
}
export const Bubble: React.FC<Bubble> = ({ name, type, preBlog, setPreBlog }) => {
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