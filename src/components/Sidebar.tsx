import React, { useState } from 'react';

export interface MenuItem {
  id: string;
  label: string;
  icon: React.ReactNode;
  children?: MenuItem[];
}

interface SidebarProps {
  activePage: string;
  onNavigate: (page: string) => void;
  menuItems: MenuItem[];
  title?: string;
  logo?: string;
}

const Sidebar: React.FC<SidebarProps> = ({ 
  activePage, 
  onNavigate, 
  menuItems,
  title = "船舶管理系统",
  logo = "/ship-icon.svg" 
}) => {
  const [expandedItems, setExpandedItems] = useState<string[]>(['inventory']); // 默认展开物资库存菜单

  const toggleExpand = (itemId: string) => {
    if (expandedItems.includes(itemId)) {
      setExpandedItems(expandedItems.filter(id => id !== itemId));
    } else {
      setExpandedItems([...expandedItems, itemId]);
    }
  };

  const renderMenuItem = (item: MenuItem) => {
    const hasChildren = item.children && item.children.length > 0;
    const isExpanded = expandedItems.includes(item.id);
    const isActive = activePage === item.id;
    
    return (
      <li key={item.id}>
        <button
          className={`flex items-center w-full px-4 py-3 text-left ${
            isActive ? 'text-blue-500 bg-blue-50' : 'text-gray-700 hover:bg-gray-100'
          }`}
          onClick={() => hasChildren ? toggleExpand(item.id) : onNavigate(item.id)}
        >
          {item.icon}
          <span className="flex-1">{item.label}</span>
          {hasChildren && (
            <svg 
              className={`w-5 h-5 transition-transform ${isExpanded ? 'transform rotate-180' : ''}`}
              viewBox="0 0 24 24" 
              fill="none" 
              xmlns="http://www.w3.org/2000/svg"
            >
              <path d="M6 9l6 6 6-6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          )}
        </button>
        
        {hasChildren && isExpanded && (
          <ul className="ml-4 border-l border-gray-200 pl-4 mt-1 mb-1">
            {item.children?.map(child => (
              <li key={child.id}>
                <button
                  className={`flex items-center w-full px-4 py-2 text-left text-sm ${
                    activePage === child.id ? 'text-blue-500 font-medium' : 'text-gray-700 hover:text-blue-500'
                  }`}
                  onClick={() => onNavigate(child.id)}
                >
                  {child.icon}
                  {child.label}
                </button>
              </li>
            ))}
          </ul>
        )}
      </li>
    );
  };

  return (
    <div className="w-56 bg-white border-r border-gray-200 flex flex-col h-full">
      <div className="p-4 border-b border-gray-200">
        <div className="flex items-center">
          <img src={logo} alt="系统图标" className="w-8 h-8 text-blue-500" />
          <span className="ml-2 font-bold text-xl">{title}</span>
        </div>
      </div>
      
      <div className="flex-1 overflow-y-auto">
        <ul className="py-2">
          {menuItems.map(renderMenuItem)}
        </ul>
      </div>
      
      <div className="p-4 border-t border-gray-200 flex items-center justify-center">
        <svg className="w-5 h-5 text-gray-500" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M12 12h7m-7-7v14" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
        </svg>
      </div>
    </div>
  );
};

export default Sidebar; 