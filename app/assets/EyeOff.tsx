import * as React from "react"
import { SVGProps } from "react"
const EyeOff = (props: SVGProps<SVGSVGElement>) => (
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
      d="M2.184 8c-.345.535-.517 1.047-.517 2 0 1.366.354 1.827 1.062 2.747 1.414 1.836 3.786 3.92 7.271 3.92.908 0 1.74-.142 2.5-.383M17.816 12c.345-.535.517-1.047.517-2 0-1.366-.354-1.827-1.062-2.747-1.414-1.836-3.786-3.92-7.27-3.92a8.2 8.2 0 0 0-2.5.383M12.396 9.286a2.5 2.5 0 0 0-2.114-1.77m-.564 4.968a2.5 2.5 0 0 1-2.114-1.77M1 3l18 14"
    />
  </svg>
)
export default EyeOff
