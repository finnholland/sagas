import * as React from "react"
import { SVGProps } from "react"
const Plus = (props: SVGProps<SVGSVGElement>) => (
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
      d="M7 1v12M1 7h12"
    />
  </svg>
)
export default Plus
