import React from "react";
import { themes } from "../themes";

// ==================== King ==================== //
export const DefaultKing = ({ color = "black", squareWidth = 35, theme = themes.Classic, ...props }) => {
  const { primary, secondary } = color === "white" ? theme.white : theme.black;

  return (
    <svg width={squareWidth} height={squareWidth} viewBox="0 0 35 36" fill="none" xmlns="http://www.w3.org/2000/svg" {...props}>
      <g transform="scale(0.8) translate(4,4)">
        <path d="M17.5 6.63V1" stroke={primary} strokeWidth="1.5" strokeLinecap="round"/>
        <path fillRule="evenodd" clipRule="evenodd" d="M17.5 20C17.5 20 22 12.5 20.5 9.5C20.5 9.5 19.5 7 17.5 7C15.5 7 14.5 9.5 14.5 9.5C13 12.5 17.5 20 17.5 20Z" fill={primary} stroke="black" strokeWidth="1.5"/>
        <path fillRule="evenodd" clipRule="evenodd" d="M6.5 32C12 35.5 22 35.5 27.5 32V25C27.5 25 36.5 20.5 33.5 14.5C29.5 8 20 11 17.5 18.5C14 11 4.5 8 1.5 14.5C-1.5 20.5 6.5 24.5 6.5 24.5V32Z" fill={primary}/>
        <path d="M17.5 18.5C20 11 29.5 8 33.5 14.5C36.5 20.5 27.5 25 27.5 25V32C22 35.5 12 35.5 6.5 32V24.5C6.5 24.5 -1.5 20.5 1.5 14.5C4.5 8 14 11 17.5 18.5ZM17.5 18.5V22" stroke="black" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
        <path d="M15 3H20" stroke={primary} strokeWidth="1.5" strokeLinecap="round"/>
        <path d="M27 24.5C27 24.5 35.5 20.5 33.03 14.85C29.15 9 20 13 17.5 19.5M17.5 19.5L17.51 21.6M17.5 19.5C15 13 4.90595 9 1.99695 14.85C-0.500045 20.5 6.84996 23.85 6.84996 23.85" stroke="black" strokeWidth="1" strokeLinecap="round" strokeLinejoin="round"/>
        <path d="M6.5 25C12 22 22 22 27.5 25M6.5 28.5C12 25.5 22 25.5 27.5 28.5M6.5 32C12 29 22 29 27.5 32" stroke="black" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
      </g>
    </svg>
  );
};

// ==================== Queen ==================== //
export const DefaultQueen = ({ color = "black", squareWidth = 39, theme = themes.Classic, ...props }) => {
  const { primary, secondary } = color === "white" ? theme.white : theme.black;

  return (
    <svg
      width={squareWidth}
      height={squareWidth}
      viewBox="0 0 39 37"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      {...props}
    >
      <g transform="scale(0.75) translate(5,5)">
        <path d="M3 9.75C4.51878 9.75 5.75 8.51878 5.75 7C5.75 5.48122 4.51878 4.25 3 4.25C1.48122 4.25 0.25 5.48122 0.25 7C0.25 8.51878 1.48122 9.75 3 9.75Z" fill={primary} stroke="black"/>
        <path d="M11 6.75C12.5188 6.75 13.75 5.51878 13.75 4C13.75 2.48122 12.5188 1.25 11 1.25C9.48122 1.25 8.25 2.48122 8.25 4C8.25 5.51878 9.48122 6.75 11 6.75Z" fill={primary} stroke="black"/>
        <path d="M19.5 5.75C21.0188 5.75 22.25 4.51878 22.25 3C22.25 1.48122 21.0188 0.25 19.5 0.25C17.9812 0.25 16.75 1.48122 16.75 3C16.75 4.51878 17.9812 5.75 19.5 5.75Z" fill={primary} stroke="black"/>
        <path d="M28 6.75C29.5188 6.75 30.75 5.51878 30.75 4C30.75 2.48122 29.5188 1.25 28 1.25C26.4812 1.25 25.25 2.48122 25.25 4C25.25 5.51878 26.4812 6.75 28 6.75Z" fill={primary} stroke="black"/>
        <path d="M36 9.75C37.5188 9.75 38.75 8.51878 38.75 7C38.75 5.48122 37.5188 4.25 36 4.25C34.4812 4.25 33.25 5.48122 33.25 7C33.25 8.51878 34.4812 9.75 36 9.75Z" fill={primary} stroke="black"/>
        <path fillRule="evenodd" clipRule="evenodd" d="M6 21C14.5 19.5 27 19.5 33 21L35.5 8.5L28 20L27.7 5.9L22.5 19.5L19.5 5L16.5 19.5L11.3 5.9L11 20L3.5 8.5L6 21Z" fill={primary} stroke="black" strokeWidth="1" strokeLinejoin="round"/>
        <path fillRule="evenodd" clipRule="evenodd" d="M6 21C6 23 7.5 23 8.5 25C9.5 26.5 9.5 26 9 28.5C7.5 29.5 7.5 31 7.5 31C6 32.5 8 33.5 8 33.5C14.5 34.5 24.5 34.5 31 33.5C31 33.5 32.5 32.5 31 31C31 31 31.5 29.5 30 28.5C29.5 26 29.5 26.5 30.5 25C31.5 23 33 23 33 21C24.5 19.5 14.5 19.5 6 21Z" fill={primary} stroke="black" strokeWidth="1.5" strokeLinejoin="round"/>
        <path d="M8 33.5C15.4478 36.091 23.5522 36.091 31 33.5" stroke={primary} strokeWidth="1.5" strokeLinejoin="round"/>
        <path d="M8 24C15.4478 21.409 23.5522 21.409 31 24" stroke="black" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
        <path d="M9.5 26.5H29.5" stroke="black" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
        <path d="M8.5 29.5C15.6427 31.8647 23.3573 31.8647 30.5 29.5" stroke="black" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
        <path d="M7.5 32.5C15.25 35.3286 23.75 35.3286 31.5 32.5" stroke="black" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
      </g>
    </svg>
  );
};


// ==================== Rook ==================== //
export const DefaultRook = ({ color = "black", squareWidth = 29, theme = themes.Classic, ...props }) => {
  const { primary, secondary } = color === "white" ? theme.white : theme.black;

  return (
    <svg
      width={squareWidth}
      height={squareWidth}
      viewBox="0 0 29 32"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      {...props}
    >
      <g transform="scale(0.75) translate(3,3)">
        <path fillRule="evenodd" clipRule="evenodd" d="M1 31H28V28H1V31Z" fill={primary} stroke="black" strokeWidth="1.5" strokeLinejoin="round"/>
        <path fillRule="evenodd" clipRule="evenodd" d="M4.5 24L6 21.5H23L24.5 24H4.5Z" fill={primary} stroke="black" strokeWidth="1.5" strokeLinejoin="round"/>
        <path fillRule="evenodd" clipRule="evenodd" d="M4 28V24H25V28H4Z" fill={primary} stroke="black" strokeWidth="1.5" strokeLinejoin="round"/>
        <path fillRule="evenodd" clipRule="evenodd" d="M6 21.5V8.5H23V21.5H6Z" fill={primary} stroke="black" strokeWidth="1.5"/>
        <path fillRule="evenodd" clipRule="evenodd" d="M6 8.5L3 6H26L23 8.5H6Z" fill={primary} stroke="black" strokeWidth="1.5" strokeLinejoin="round"/>
        <path fillRule="evenodd" clipRule="evenodd" d="M3 6V1H7V3H12V1H17V3H22V1H26V6H3Z" fill={primary} stroke="black" strokeWidth="1.5" strokeLinejoin="round"/>
        <path d="M4 27.5H25" stroke="black" strokeLinecap="round"/>
        <path d="M5 23.5H24" stroke="black" strokeLinecap="round"/>
        <path d="M6 21.5H23" stroke="black" strokeLinecap="round"/>
        <path d="M6 8.5H23" stroke="black" strokeLinecap="round"/>
        <path d="M3 6H26" stroke="black" strokeLinecap="round"/>
      </g>
    </svg>
  );
};


// ==================== Bishop ==================== //
export const DefaultBishop = ({ color = "black", squareWidth = 35, theme = themes.Classic, ...props }) => {
  const { primary, secondary } = color === "white" ? theme.white : theme.black;

  return (
    <svg
      width={squareWidth}
      height={squareWidth}
      viewBox="0 0 35 36"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      {...props}
    >
      <g transform="scale(0.75) translate(4,3)">
        <path
          fillRule="evenodd"
          clipRule="evenodd"
          d="M4 32C7.39 31.03 14.11 32.43 17.5 30C20.89 32.43 27.61 31.03 31 32C31 32 32.65 32.54 34 34C33.32 34.97 32.35 34.99 31 34.5C27.61 33.53 20.89 34.96 17.5 33.5C14.11 34.96 7.39 33.53 4 34.5C2.646 34.99 1.677 34.97 1 34C2.354 32.06 4 32 4 32Z"
          fill={primary}
          stroke="black"
          strokeWidth="1.5"
          strokeLinejoin="round"
        />
        <path
          fillRule="evenodd"
          clipRule="evenodd"
          d="M9.99999 28C12.5 30.5 22.5 30.5 25 28C25.5 26.5 25 26 25 26C25 23.5 22.5 22 22.5 22C28 20.5 28.5 10.5 17.5 6.5C6.49999 10.5 6.99999 20.5 12.5 22C12.5 22 9.99999 23.5 9.99999 26C9.99999 26 9.49999 26.5 9.99999 28Z"
          fill={primary}
          stroke="black"
          strokeWidth="1.5"
          strokeLinejoin="round"
        />
        <path
          fillRule="evenodd"
          clipRule="evenodd"
          d="M20 4C20 4.66304 19.7366 5.29893 19.2678 5.76777C18.7989 6.23661 18.163 6.5 17.5 6.5C16.837 6.5 16.2011 6.23661 15.7322 5.76777C15.2634 5.29893 15 4.66304 15 4C15 3.33696 15.2634 2.70107 15.7322 2.23223C16.2011 1.76339 16.837 1.5 17.5 1.5C18.163 1.5 18.7989 1.76339 19.2678 2.23223C19.7366 2.70107 20 3.33696 20 4Z"
          fill={primary}
          stroke="black"
          strokeWidth="1.5"
          strokeLinejoin="round"
        />
        <path
          d="M12.5 22H22.5M10 26H25M17.5 11.5V16.5M15 14H20"
          stroke="black"
          strokeWidth="1.5"
          strokeLinecap="round"
        />
      </g>
    </svg>
  );
};


// ==================== Knight ==================== //
export const DefaultKnight = ({ color = "black", squareWidth = 35, theme = themes.Classic, ...props }) => {
  const { primary, secondary } = color === "white" ? theme.white : theme.black;

  return (
    <svg
      width={squareWidth}
      height={squareWidth}
      viewBox="0 0 35 36"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      {...props}
    >
      <g transform="scale(0.7) translate(6,5)">
        <path fillRule="evenodd" clipRule="evenodd" d="M17 4C27.5 5 33.5 12 33 33H10C10 24 20 26.5 18 12" fill={primary}/>
        <path d="M17 4C27.5 5 33.5 12 33 33H10C10 24 20 26.5 18 12" stroke="black" strokeWidth="2.0" strokeLinecap="round" strokeLinejoin="round"/>
        <path fillRule="evenodd" clipRule="evenodd" d="M19 12C19.38 14.91 13.45 19.37 11 21C8 23 8.18 25.34 6 25C4.958 24.06 7.41 21.96 6 22C5 22 6.19 23.23 5 24C4 24 0.997002 25 1 20C1 18 7 8 7 8C7 8 8.89 6.1 9 4.5C8.27 3.506 8.5 2.5 8.5 1.5C9.5 0.5 11.5 4 11.5 4H13.5C13.5 4 14.28 2.008 16 1C17 1 17 4 17 4" fill={primary}/>
        <path d="M19 12C19.38 14.91 13.45 19.37 11 21C8 23 8.18 25.34 6 25C4.958 24.06 7.41 21.96 6 22C5 22 6.19 23.23 5 24C4 24 0.997002 25 1 20C1 18 7 8 7 8C7 8 8.89 6.1 9 4.5C8.27 3.506 8.5 2.5 8.5 1.5C9.5 0.5 11.5 4 11.5 4H13.5C13.5 4 14.28 2.008 16 1C17 1 17 4 17 4" stroke="black" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
        <path fillRule="evenodd" clipRule="evenodd" d="M4.5 19.5C4.5 19.6326 4.44732 19.7598 4.35355 19.8536C4.25979 19.9473 4.13261 20 4 20C3.86739 20 3.74021 19.9473 3.64645 19.8536C3.55268 19.7598 3.5 19.6326 3.5 19.5C3.5 19.3674 3.55268 19.2402 3.64645 19.1464C3.74021 19.0527 3.86739 19 4 19C4.13261 19 4.25979 19.0527 4.35355 19.1464C4.44732 19.2402 4.5 19.3674 4.5 19.5Z" fill="black" stroke="black" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
        <path fillRule="evenodd" clipRule="evenodd" d="M9.93299 9.75C9.73407 10.0945 9.49769 10.3986 9.27583 10.5953C9.05398 10.792 8.86482 10.8653 8.74999 10.799C8.63515 10.7327 8.60403 10.5323 8.66348 10.2418C8.72293 9.95126 8.86807 9.59452 9.06699 9.25C9.2659 8.90549 9.50228 8.60142 9.72414 8.4047C9.94599 8.20797 10.1351 8.1347 10.25 8.201C10.3648 8.26731 10.3959 8.46776 10.3365 8.75825C10.277 9.04874 10.1319 9.40549 9.93299 9.75Z" fill={secondary} stroke="black" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
        <path fillRule="evenodd" clipRule="evenodd" d="M19.55 4.39999L19.1 5.84999L19.6 5.99999C22.75 6.99999 25.25 8.48999 27.5 12.75C29.75 17.01 30.75 23.06 30.25 33L30.2 33.5H32.45L32.5 33C33 22.94 31.62 16.15 29.25 11.66C26.88 7.16999 23.46 5.01999 20.06 4.49999L19.55 4.39999Z" fill="black"/>
      </g>
    </svg>
  );
};


// ==================== Pawn ==================== //
export const DefaultPawn = ({
  color = "black",
  squareWidth = 35,
  theme = themes.Classic,
  ...props
}) => {
  const { primary } = color === "white" ? theme.white : theme.black;

  return (
    <svg
      width={squareWidth}
      height={squareWidth}
      viewBox="0 0 35 36"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      {...props}
    >
      <g transform="translate(6.5, 4.5) scale(0.75)">
        <path
          d="M13 1C10.79 1 9 2.79 9 5C9 5.89 9.29 6.71 9.78 7.38C7.83 8.5 6.5 10.59 6.5 13C6.5 15.03 7.44 16.84 8.91 18.03C5.91 19.09 1.5 23.58 1.5 31.5H24.5C24.5 23.58 20.09 19.09 17.09 18.03C18.56 16.84 19.5 15.03 19.5 13C19.5 10.59 18.17 8.5 16.22 7.38C16.71 6.71 17 5.89 17 5C17 2.79 15.21 1 13 1Z"
          fill={primary}
          stroke="black"
          strokeWidth="1.5"
          strokeLinecap="round"
        />
      </g>
    </svg>
  );
};