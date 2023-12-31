import * as React from "react"
import { SVGProps } from "react"
const Heart = (props: SVGProps<SVGSVGElement>) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 20 20"
    fill="none"
    {...props}
  >
    <path
      stroke={props.stroke}
      strokeWidth={props.strokeWidth}
      fill={props.fill}
      d="M12.068 15.17h-.001c-.44.347-.824.645-1.191.86-.369.215-.65.303-.876.303-.226 0-.507-.088-.876-.304-.368-.215-.752-.513-1.191-.859-.246-.193-.495-.385-.745-.578-1.043-.805-2.103-1.622-2.98-2.609-1.06-1.194-1.791-2.577-1.791-4.369 0-1.746.986-3.203 2.322-3.814 1.289-.588 3.037-.444 4.72 1.305l.541.562.54-.562c1.684-1.749 3.432-1.893 4.721-1.304 1.336.61 2.322 2.068 2.322 3.814 0 1.792-.731 3.175-1.792 4.369-.877.988-1.939 1.806-2.985 2.612-.248.19-.495.381-.738.573Z"
    />
  </svg>
)
export default Heart
