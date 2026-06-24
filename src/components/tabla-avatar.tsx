// Original stylized illustration — not based on any photograph or specific person.
export function TablaAvatar({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 200 200"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      role="img"
      aria-label="Illustration of a musician playing tabla"
    >
      <circle cx="100" cy="100" r="98" fill="#fdf3e3" />

      {/* shoulders / kurta */}
      <path
        d="M40 178 C40 138 64 120 100 120 C136 120 160 138 160 178 Z"
        fill="#c97b3d"
      />
      <path
        d="M40 178 C40 138 64 120 100 120 C136 120 160 138 160 178 Z"
        fill="none"
        stroke="#a85f28"
        strokeWidth="2"
      />

      {/* neck */}
      <rect x="90" y="96" width="20" height="22" rx="8" fill="#e3a76f" />

      {/* head */}
      <circle cx="100" cy="70" r="34" fill="#e3a76f" />

      {/* simple hairstyle, neutral, no specific likeness */}
      <path
        d="M66 64 C66 36 134 36 134 64 C134 50 118 40 100 40 C82 40 66 50 66 64 Z"
        fill="#2b2b2b"
      />

      {/* eyes (closed, focused — calm practice expression) */}
      <path d="M84 72 q6 4 12 0" stroke="#2b2b2b" strokeWidth="2.5" fill="none" strokeLinecap="round" />
      <path d="M104 72 q6 4 12 0" stroke="#2b2b2b" strokeWidth="2.5" fill="none" strokeLinecap="round" />

      {/* gentle smile */}
      <path d="M90 86 q10 6 20 0" stroke="#7a4a26" strokeWidth="2.5" fill="none" strokeLinecap="round" />

      {/* arms reaching forward to the drums */}
      <path d="M58 150 Q50 168 60 182" stroke="#c97b3d" strokeWidth="16" strokeLinecap="round" fill="none" />
      <path d="M142 150 Q150 168 140 182" stroke="#c97b3d" strokeWidth="16" strokeLinecap="round" fill="none" />

      {/* hands */}
      <circle cx="61" cy="184" r="8" fill="#e3a76f" />
      <circle cx="139" cy="184" r="8" fill="#e3a76f" />

      {/* bayan (bass drum), left */}
      <g>
        <ellipse cx="55" cy="196" rx="26" ry="9" fill="#3a3a3a" />
        <ellipse cx="55" cy="190" rx="26" ry="9" fill="#e9ddc3" />
        <circle cx="55" cy="190" r="9" fill="#0a0a0a" />
      </g>

      {/* dayan (treble drum), right */}
      <g>
        <ellipse cx="145" cy="196" rx="20" ry="7" fill="#8a5a32" />
        <ellipse cx="145" cy="191" rx="20" ry="7" fill="#ecdfc4" />
        <circle cx="145" cy="191" r="6" fill="#0a0a0a" />
      </g>
    </svg>
  );
}
