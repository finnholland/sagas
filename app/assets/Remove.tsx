import * as React from "react"
import { SVGProps } from "react"
const Remove = (props: SVGProps<SVGSVGElement>) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 14 14"
    fill="none"
    {...props}
  >
    <path
      stroke="#6ED0D7"
      strokeLinecap="round"
      strokeWidth={1.5}
      d="m2 2 10 10m0-10L2 12"
    />
  </svg>
)
export default Remove
