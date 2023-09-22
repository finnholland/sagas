import * as React from "react"
import { SVGProps } from "react"
const ArrowRight = (props: SVGProps<SVGSVGElement>) => (
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
      d="m5 2 3.586 3.586a2 2 0 0 1 0 2.828L5 12"
    />
  </svg>
)
export default ArrowRight
