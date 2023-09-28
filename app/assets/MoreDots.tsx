import * as React from "react"
import { SVGProps } from "react"
const MoreDots = (props: SVGProps<SVGSVGElement>) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 10 10"
    fill="none"
    {...props}
  >
    <circle cx={5} cy={2} r={1} fill="#333" />
    <circle cx={5} cy={5} r={1} fill="#333" />
    <circle cx={5} cy={8} r={1} fill="#333" />
  </svg>
)
export default MoreDots
