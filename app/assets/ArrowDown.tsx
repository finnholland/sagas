import * as React from "react"
import { SVGProps } from "react"
const ArrowDown = (props: SVGProps<SVGSVGElement>) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 15 15"
    fill="none"
    {...props}
  >
    <path
      stroke={props.stroke}
      strokeLinecap="round"
      strokeWidth={1.5}
      d="M12.5 5.5 8.914 9.086a2 2 0 0 1-2.828 0L2.5 5.5"
    />
  </svg>
)
export default ArrowDown
