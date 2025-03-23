import * as React from 'react'

const MsTeamsIcon: React.FC<React.SVGProps<SVGElement>> = (props) => {
  const { className } = props
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 256 256"
      className={`dark:fill-white ${className}`}
    >
      <g
        strokeMiterlimit="10"
        fontFamily="none"
        fontSize="none"
        fontWeight="none"
        style={{ mixBlendMode: 'normal' }}
        textAnchor="none"
      >
        <path
          className="dark:fill-white dark:group-hover:fill-black"
          fill="#000"
          d="M221.333 69.333c-10.31 0-18.666 8.358-18.666 18.667s8.357 18.667 18.666 18.667S240 98.309 240 88s-8.357-18.667-18.667-18.667m-200 144L144 234.667V21.333L21.333 42.667z"
        ></path>
        <path
          className="dark:fill-black dark:group-hover:fill-white"
          fill="#fff"
          d="M112 86.773v14.56l-21.28.96-.107 63.254-15.893-.48V102.88l-21.387.853V90.347z"
        ></path>
        <path
          className="dark:fill-white dark:group-hover:fill-black"
          fill="#000"
          d="M192 74.667C192 86.453 182.453 96 170.667 96c-6.4 0-12.107-2.827-16-7.253v-28.16c3.893-4.427 9.6-7.254 16-7.254 11.786 0 21.333 9.547 21.333 21.334m10.667 48v58.666h18.666c9.398 0 17.094-6.965 18.4-16H240v-42.666zm-48-16v90.666h18.666c9.398 0 17.094-6.965 18.4-16H192v-74.666z"
        ></path>
      </g>
    </svg>
  )
}

export default MsTeamsIcon
