import * as React from "react"
import { SVGProps } from "react"
const Share = (props: SVGProps<SVGSVGElement>) => (
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
      d="m12.857 12.857 2.857 2.857 2.857-2.857"
    />
    <path
      stroke={props.stroke}
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={1.5}
      d="M9.048 4.286h2.857a3.81 3.81 0 0 1 3.81 3.81v7.618M7.142 7.143 4.286 4.286 1.429 7.143"
    />
    <path
      stroke={props.stroke}
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={1.5}
      d="M10.952 15.714H8.095a3.81 3.81 0 0 1-3.81-3.81V4.287"
    />
  </svg>
)
export default Share
