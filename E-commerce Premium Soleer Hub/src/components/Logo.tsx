import React from 'react';
import { Zap } from 'lucide-react';

interface LogoProps {
  className?: string;
  size?: 'sm' | 'md' | 'lg';
}

export const Logo: React.FC<LogoProps> = ({ className = '', size = 'md' }) => {
  const sizes = {
    sm: 'text-xl',
    md: 'text-2xl',
    lg: 'text-4xl'
  };

  return (
    <div className={`flex items-center gap-2 font-bold ${sizes[size]} ${className}`}>
      <div className="relative">
        <Zap className="fill-[#e50914] text-[#e50914]" strokeWidth={2} />
      </div>
      <span className="bg-gradient-to-r from-[#e50914] to-red-600 bg-clip-text text-white">
        Soleer Hub
      </span>
    </div>
  );
};
