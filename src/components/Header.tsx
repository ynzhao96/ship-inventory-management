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
  notificationCount = 0, 
  onBack, 
  userName = "管理员", 
  userAvatar = "/avatar.png" 
}) => {
  return (
    <header className="bg-blue-900 text-white shadow z-10">
      <div className=" px-4 py-3 flex justify-between items-center">
        <div className="flex items-center">
            <button 
                onClick={onBack}
                className="mr-3 hover:bg-blue-800 p-1 rounded"
                style={{ visibility: onBack ? 'visible' : 'hidden' }}
            >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 19l-7-7 7-7" />
                </svg>
            </button>
          <img src="/ship-icon.svg" alt="船舶图标" className="w-8 h-8 mr-2" />
          <h1 className="text-xl font-bold">{title}</h1>
        </div>
        <div className="flex items-center space-x-4">
          <div className="relative">
            {notificationCount > 0 && (
              <span className="absolute top-0 right-0 -mt-1 -mr-1 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
                {notificationCount}
              </span>
            )}
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
            </svg>
          </div>
          <div className="flex items-center">
            <img src={userAvatar} alt="用户头像" className="w-8 h-8 rounded-full mr-2" />
            <span>{userName}</span>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header; 