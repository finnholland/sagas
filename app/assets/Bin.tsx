import * as React from "react"
import { SVGProps } from "react"
const Bin = (props: SVGProps<SVGSVGElement>) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 20 20"
    fill="none"
    {...props}
  >
    <path
      stroke={props["aria-atomic"] ? '#DD2E44' : '#9C4F58'}
      strokeLinecap="round"
      strokeWidth={1.5}
      d="M7.642 3.333a2.5 2.5 0 0 1 4.716 0M17.083 5H2.917m12.394 7.833c-.148 2.212-.221 3.318-.942 3.992-.72.675-1.829.675-4.046.675h-.645c-2.217 0-3.325 0-4.047-.675-.721-.674-.794-1.78-.942-3.992l-.383-5.75m11.388 0-.167 2.5m-7.61-.416.416 4.166m3.75-4.166-.416 4.166"
    />
  </svg>
)
export default Bin
