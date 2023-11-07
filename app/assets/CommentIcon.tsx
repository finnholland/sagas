import * as React from "react"
import { SVGProps } from "react"
const CommentIcon = (props: SVGProps<SVGSVGElement>) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 20 20"
    fill="none"
    {...props}
  >
    <path
      stroke={props.stroke}
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={1.5}
      d="M10 17.5a7.5 7.5 0 1 0-6.667-4.06l-.68 3.317a.5.5 0 0 0 .59.59l3.318-.68c1.03.532 2.2.833 3.439.833Z"
    />
  </svg>
)
export default CommentIcon
