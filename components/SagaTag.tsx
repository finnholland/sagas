import {Plus, Remove } from "@/app/assets"
import { DATE_TYPE } from "@/app/constants"
import { toggleSagaFilter, getDateAge, toggleTagFilter } from "@/app/helpers/helpers"
import { Dispatch, SetStateAction } from "react"

interface SagaProps {
  name: string,
  updated: string,
  filterSaga: string
  setFilterSaga: Dispatch<SetStateAction<string>>
}
export const SagaFilter: React.FC<SagaProps> = ({ name, updated, filterSaga, setFilterSaga }) => {
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
export const TagFilter: React.FC<TagProps> = ({ name, filterTags, setFilterTags }) => {
  return (
    <div onClick={() => toggleTagFilter({ name, filterTags, setFilterTags })} className='flex-row flex w-full justify-between my-2 cursor-pointer'>
      <span className={`font-medium ${filterTags.includes(name) ? 'text-sky-300' : ''}`}>{name}</span>
      {filterTags.includes(name) ? <Remove width={15} /> : <Plus width={15} />}
    </div>
  )
}