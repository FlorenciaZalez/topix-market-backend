import type { ReactNode } from 'react';

type GlassCardProps = {
  children: ReactNode;
  className?: string;
};

export function GlassCard({ children, className = '' }: GlassCardProps) {
  return (
    <div
      className={`rounded-[32px] border border-white/60 bg-white/62 p-6 shadow-soft backdrop-blur-md transition duration-300 hover:-translate-y-1 hover:shadow-float ${className}`}
    >
      {children}
    </div>
  );
}
