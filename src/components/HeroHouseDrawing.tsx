export function HeroHouseDrawing() {
  return (
    <div className="w-full max-w-[520px] mx-auto select-none" aria-hidden="true">
      <svg
        viewBox="0 0 560 400"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="w-full h-auto"
      >
        {/* Subtle drafting datum lines */}
        <line
          x1="28"
          y1="336"
          x2="532"
          y2="336"
          stroke="#B38B52"
          strokeOpacity="0.45"
          strokeWidth="1"
          className="architectural-line-draw"
        />
        <line
          x1="56"
          y1="62"
          x2="56"
          y2="348"
          stroke="#B38B52"
          strokeOpacity="0.22"
          strokeWidth="0.75"
          strokeDasharray="4 4"
        />

        {/* Primary cantilevered architectural residence elevation */}
        <path
          d="M 88 336 L 88 186 L 210 186 L 210 108 L 434 108 L 434 176 L 478 176 L 478 336"
          stroke="#B38B52"
          strokeWidth="1.5"
          strokeLinecap="square"
          strokeLinejoin="miter"
          className="architectural-line-draw"
        />

        {/* Cantilevered roof canopy & soffit */}
        <path
          d="M 168 108 L 468 108 L 468 96 L 168 96 Z"
          stroke="#B38B52"
          strokeWidth="1.35"
          className="architectural-line-draw"
        />

        {/* Lower terrace overhang */}
        <path
          d="M 72 186 L 246 186 L 246 196 L 72 196"
          stroke="#B38B52"
          strokeWidth="1.2"
          className="architectural-line-draw"
        />

        {/* Double-height entry portal & courtyard glazing */}
        <path
          d="M 248 336 L 248 134 L 324 134 L 324 336"
          stroke="#B38B52"
          strokeWidth="1.2"
          className="architectural-line-draw"
        />
        <line
          x1="286"
          y1="134"
          x2="286"
          y2="336"
          stroke="#B38B52"
          strokeWidth="0.9"
          strokeOpacity="0.8"
          className="architectural-line-draw"
        />

        {/* Upper bedroom louvers & terrace balcony */}
        <path
          d="M 352 134 L 414 134 L 414 214 L 352 214 Z"
          stroke="#B38B52"
          strokeWidth="1.1"
          className="architectural-line-draw"
        />
        <path
          d="M 366 134 L 366 214 M 380 134 L 380 214 M 394 134 L 394 214"
          stroke="#B38B52"
          strokeWidth="0.85"
          strokeOpacity="0.65"
          className="architectural-line-draw"
        />

        {/* Ground-floor reception glazing */}
        <path
          d="M 114 220 L 214 220 L 214 336 M 164 220 L 164 336"
          stroke="#B38B52"
          strokeWidth="1.1"
          className="architectural-line-draw"
        />
        <path
          d="M 352 238 L 452 238 L 452 336 M 402 238 L 402 336"
          stroke="#B38B52"
          strokeWidth="1.1"
          className="architectural-line-draw"
        />

        {/* Courtyard steps & reflection basin */}
        <path
          d="M 226 336 L 226 324 L 340 324 L 340 336"
          stroke="#B38B52"
          strokeWidth="1"
          className="architectural-line-draw"
        />
        <path
          d="M 102 354 L 460 354"
          stroke="#B38B52"
          strokeOpacity="0.35"
          strokeWidth="1"
          className="architectural-line-draw"
        />

        {/* Architectural elevation ticks */}
        <circle cx="56" cy="96" r="2.5" stroke="#B38B52" strokeWidth="1" />
        <circle cx="56" cy="186" r="2.5" stroke="#B38B52" strokeWidth="1" />
        <circle cx="56" cy="336" r="2.5" stroke="#B38B52" strokeWidth="1" />
      </svg>
    </div>
  );
}
