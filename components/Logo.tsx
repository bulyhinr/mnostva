
import React from 'react';
// @ts-ignore
import iconMnostva from '../content/icon_mnostva.png';

const Logo: React.FC<{ className?: string }> = ({ className = "h-12" }) => {
  return (
    <div className={`${className} flex items-center select-none`}>
      <img
        src={iconMnostva}
        alt="Mnostva Art Logo"
        className="h-full w-auto object-contain transition-transform duration-500 scale-[2.5] translate-x-6 hover:scale-[2.7] active:scale-[2.3]"
        onError={(e) => {
          // Резервный вариант, если файл не найден (показывает текст)
          (e.target as HTMLImageElement).style.display = 'none';
          (e.target as HTMLImageElement).parentElement!.innerHTML = '<span class="text-white font-black text-xl">Mnostva Art</span>';
        }}
      />
    </div>
  );
};

export default Logo;
