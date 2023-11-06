import * as React from "react"
import { SVGProps } from "react"
const Mention = (props: SVGProps<SVGSVGElement>) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 20 20"
    fill="none"
    {...props}
  >
    <path
      stroke={props.fill}
      strokeLinecap="round"
      strokeWidth={props.strokeWidth}
      d="M9.997 17a7 7 0 1 1 6.58-4.604 1.796 1.796 0 0 1-.482.7l-.093.085a1.91 1.91 0 0 1-3.205-1.403V10m0 0a2.8 2.8 0 1 1-5.6 0 2.8 2.8 0 0 1 5.6 0Z"
    />
  </svg>
)
export default Mention
