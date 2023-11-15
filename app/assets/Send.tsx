import * as React from "react"
import { SVGProps } from "react"
const Send = (props: SVGProps<SVGSVGElement>) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 20 20"
    fill="none"
    {...props}
  >
    <g clipPath="url(#a)">
      <path
        stroke={props.stroke}
        fill={props["aria-atomic"] ? "#75D0ED" : "#ffffff00"}
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={props.strokeWidth}
        d="m6.544 13.546-3.56-2.848c-1.018-.814-.748-2.432.482-2.87l10.372-3.704c1.324-.474 2.603.805 2.13 2.13l-3.705 10.371c-.439 1.229-2.056 1.5-2.87.481l-2.849-3.56Zm0 0 4.125-4.124"
      />
    </g>
  </svg>
)
export default Send
