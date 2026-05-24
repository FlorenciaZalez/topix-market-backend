import type { ReactNode } from 'react';

type PageIntroProps = {
  eyebrow: string;
  title: string;
  description: string;
  actions?: ReactNode;
  align?: 'left' | 'center';
  className?: string;
};

export function PageIntro({ eyebrow, title, description, actions, align = 'left', className = '' }: PageIntroProps) {
  const alignmentClass = align === 'center' ? 'items-center text-center' : 'items-start text-left';

  return (
    <div className={`flex flex-col gap-6 ${alignmentClass} ${className}`.trim()}>
      <div>
        <p className="topix-kicker">{eyebrow}</p>
        <h1 className="topix-title">{title}</h1>
        <p className="topix-copy">{description}</p>
      </div>
      {actions ? <div className={`flex flex-wrap gap-3 ${align === 'center' ? 'justify-center' : ''}`}>{actions}</div> : null}
    </div>
  );
}