import React from 'react';

interface HeaderProps {
  title: string;
  notificationCount?: number;
  onBack?: () => void;
  userName?: string;
  userAvatar?: string;
}

const Header: React.FC<HeaderProps> = ({
  title,
  onBack }) => {
  return (
    <header className="bg-blue-900 text-white shadow z-10">
      <div className=" px-4 py-3 flex justify-between items-center">
        <div className="flex items-center">
          <button
            onClick={onBack}
            className="mr-3 bg-inherit hover:bg-blue-800 p-1 rounded"
            style={{ visibility: onBack ? 'visible' : 'hidden' }}
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 19l-7-7 7-7" />
            </svg>
          </button>
          <img src="/ship-icon.svg" alt="船舶图标" className="w-8 h-8 mr-2" />
          <h1 className="text-xl font-bold">{title}</h1>
        </div>

      </div>
    </header>
  );
};

export default Header; 