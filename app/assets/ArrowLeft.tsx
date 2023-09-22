import * as React from "react"
import { SVGProps } from "react"
const ArrowLeft = (props: SVGProps<SVGSVGElement>) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 15 15"
    fill="none"
    {...props}
  >
    <path
      stroke="#6ED0D7"
      strokeLinecap="round"
      strokeWidth={1.5}
      d="M10 13 6.414 9.414a2 2 0 0 1 0-2.828L10 3"
    />
  </svg>
)
export default ArrowLeft
