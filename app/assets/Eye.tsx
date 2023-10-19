import * as React from "react"
import { SVGProps } from "react"
const Eye = (props: SVGProps<SVGSVGElement>) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 20 20"
    fill="none"
    {...props}
  >
    <path
      stroke={props.stroke}
      strokeLinecap="round"
      strokeWidth={1.5}
      d="M7.5 3.717a8.2 8.2 0 0 1 2.5-.384c3.485 0 5.857 2.084 7.27 3.92.71.922 1.063 1.381 1.063 2.747 0 1.367-.354 1.826-1.062 2.747-1.414 1.836-3.786 3.92-7.27 3.92-3.486 0-5.858-2.084-7.272-3.92-.708-.92-1.062-1.381-1.062-2.747 0-1.367.354-1.826 1.062-2.747.432-.564.913-1.09 1.438-1.569"
    />
    <path
      stroke={props.stroke}
      strokeWidth={1.5}
      d="M12.5 10a2.5 2.5 0 1 1-5 0 2.5 2.5 0 0 1 5 0Z"
    />
  </svg>
)
export default Eye
