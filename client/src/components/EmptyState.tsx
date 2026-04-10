type EmptyStateProps = {
  title: string;
  message: string;
};

export const EmptyState = ({ title, message }: EmptyStateProps) => (
  <div className="rounded-[2rem] border border-dashed border-white/15 bg-white/[0.03] p-6 text-center">
    <div className="mx-auto mb-5 flex h-20 w-20 items-center justify-center rounded-full bg-brand-500/10">
      <svg viewBox="0 0 120 120" className="h-10 w-10" aria-hidden="true">
        <path
          d="M20 70c0-8 5-14 12-18l10-21c2-4 5-6 9-6h18c4 0 7 2 9 6l10 21c7 4 12 10 12 18v8H20v-8Z"
          fill="#F59E0B"
        />
        <circle cx="38" cy="80" r="9" fill="#FDE68A" />
        <circle cx="82" cy="80" r="9" fill="#FDE68A" />
        <rect x="34" y="45" width="52" height="14" rx="7" fill="#0F172A" opacity=".28" />
      </svg>
    </div>
    <h3 className="text-lg font-bold text-white">{title}</h3>
    <p className="mt-3 text-sm leading-7 text-slate-300">{message}</p>
  </div>
);
