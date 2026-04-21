import { useState, useEffect } from "react";
import { Clock } from "lucide-react";

interface CountdownTimerProps {
  endsAt: string;
  variant?: "default" | "compact";
}

export function CountdownTimer({ endsAt, variant = "default" }: CountdownTimerProps) {
  const [timeLeft, setTimeLeft] = useState<{ d: number; h: number; m: number; s: number } | null>(null);

  useEffect(() => {
    const calc = () => {
      const diff = new Date(endsAt).getTime() - Date.now();
      if (diff > 0) {
        setTimeLeft({
          d: Math.floor(diff / (1000 * 60 * 60 * 24)),
          h: Math.floor((diff / (1000 * 60 * 60)) % 24),
          m: Math.floor((diff / 1000 / 60) % 60),
          s: Math.floor((diff / 1000) % 60),
        });
      } else setTimeLeft(null);
    };
    calc();
    const t = setInterval(calc, 1000);
    return () => clearInterval(t);
  }, [endsAt]);

  if (!timeLeft) {
    return <span className="text-sm font-bold text-red-600">অফার শেষ</span>;
  }
  const pad = (n: number) => n.toString().padStart(2, "0");

  if (variant === "compact") {
    return (
      <div className="inline-flex items-center gap-1.5 bg-red-600 text-white px-2.5 py-1 rounded-md text-xs font-bold">
        <Clock className="w-3.5 h-3.5" />
        <span className="font-mono tabular-nums">{pad(timeLeft.h)}:{pad(timeLeft.m)}:{pad(timeLeft.s)}</span>
      </div>
    );
  }

  const Cell = ({ v, l }: { v: number; l: string }) => (
    <div className="flex flex-col items-center bg-gradient-to-b from-red-600 to-red-700 text-white rounded-lg w-11 py-1 shadow-md">
      <span className="text-base font-extrabold leading-none font-mono tabular-nums">{pad(v)}</span>
      <span className="text-[8px] font-medium opacity-90 mt-0.5">{l}</span>
    </div>
  );
  return (
    <div className="flex items-center gap-1.5">
      {timeLeft.d > 0 && <Cell v={timeLeft.d} l="DAY" />}
      <Cell v={timeLeft.h} l="HR" />
      <span className="text-red-600 font-extrabold">:</span>
      <Cell v={timeLeft.m} l="MIN" />
      <span className="text-red-600 font-extrabold">:</span>
      <Cell v={timeLeft.s} l="SEC" />
    </div>
  );
}
