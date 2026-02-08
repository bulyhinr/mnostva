
import React from 'react';

const Logo: React.FC<{ className?: string }> = ({ className = "h-12" }) => {
  // Используем относительный путь к вашему локальному файлу
  const logoUrl = "./icon_mnostva.png";

  return (
    <div className={`${className} flex items-center select-none`}>
      <img 
        src={logoUrl} 
        alt="Mnostva Art Logo" 
        className="h-full w-auto object-contain transition-transform duration-500 hover:scale-105 active:scale-95"
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
