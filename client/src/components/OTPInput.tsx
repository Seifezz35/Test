import { useRef } from "react";

type OTPInputProps = {
  value: string;
  onChange: (value: string) => void;
  length?: number;
};

export const OTPInput = ({ value, onChange, length = 6 }: OTPInputProps) => {
  const refs = useRef<Array<HTMLInputElement | null>>([]);

  const chars = Array.from({ length }, (_, index) => value[index] ?? "");

  return (
    <div className="flex justify-center gap-2">
      {chars.map((char, index) => (
        <input
          key={index}
          ref={(element) => {
            refs.current[index] = element;
          }}
          value={char}
          onChange={(event) => {
            const nextChar = event.target.value.replace(/\D/g, "").slice(-1);
            const next = value.split("");
            next[index] = nextChar;
            onChange(next.join("").slice(0, length));

            if (nextChar && index < length - 1) {
              refs.current[index + 1]?.focus();
            }
          }}
          onKeyDown={(event) => {
            if (event.key === "Backspace" && !char && index > 0) {
              refs.current[index - 1]?.focus();
            }
          }}
          inputMode="numeric"
          maxLength={1}
          className="h-12 w-12 rounded-2xl border border-white/10 bg-white/5 text-center text-lg font-bold text-white outline-none transition focus:border-brand-400 focus:bg-brand-500/10"
        />
      ))}
    </div>
  );
};
