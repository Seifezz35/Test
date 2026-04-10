export const AuthIllustration = () => (
  <div className="relative mx-auto h-40 w-full max-w-sm overflow-hidden rounded-[2rem] border border-white/10 bg-slate-950/60">
    <div className="absolute inset-x-0 bottom-0 h-16 bg-gradient-to-t from-brand-500/30 to-transparent" />
    <div className="absolute -bottom-8 left-1/2 h-28 w-28 -translate-x-1/2 rounded-full bg-brand-500/25 blur-2xl" />
    <svg
      viewBox="0 0 360 180"
      className="h-full w-full animate-float-soft"
      xmlns="http://www.w3.org/2000/svg"
      fill="none"
    >
      <path d="M0 145C55 128 97 126 139 132C181 138 224 158 360 120V180H0V145Z" fill="#1E293B" />
      <path d="M0 122C55 110 97 108 139 114C181 120 224 139 360 103" stroke="#334155" strokeWidth="4" />
      <path d="M93 111C93 96 104 83 118 80L132 54C135 48 141 44 147 44H203C209 44 215 48 218 54L232 80C246 83 257 96 257 111V124H93V111Z" fill="#F59E0B" />
      <rect x="114" y="67" width="122" height="26" rx="12" fill="#0F172A" opacity="0.38" />
      <circle cx="129" cy="124" r="16" fill="#FDE68A" />
      <circle cx="221" cy="124" r="16" fill="#FDE68A" />
      <path d="M0 148H360" stroke="#F59E0B" strokeWidth="5" strokeDasharray="20 14" opacity="0.7" />
    </svg>
  </div>
);
