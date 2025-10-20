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
  const [expandedItems, setExpandedItems] = useState<string[]>(['inventory']); // 默认展开
  const [collapsed, setCollapsed] = useState(false); // 👉 新增：侧边栏收起/展开

  const toggleExpand = (itemId: string) => {
    setExpandedItems((prev) =>
      prev.includes(itemId) ? prev.filter(id => id !== itemId) : [...prev, itemId]
    );
  };

  // 收起时，点击有子项的父级，直接跳转而不是展开
  const handleItemClick = (item: MenuItem, hasChildren: boolean) => {
    if (hasChildren) {
      if (collapsed) {
        onNavigate(item.id);
      } else {
        toggleExpand(item.id);
      }
    } else {
      onNavigate(item.id);
    }
  };

  const renderMenuItem = (item: MenuItem) => {
    const hasChildren = !!(item.children && item.children.length > 0);
    const isExpanded = expandedItems.includes(item.id);
    const isActive = activePage === item.id;

    return (
      <li key={item.id}>
        <button
          className={[
            'flex items-center w-full px-4 py-3 text-left transition-colors',
            isActive ? 'text-blue-500 bg-blue-50' : 'text-gray-700 hover:bg-gray-100',
            collapsed ? 'justify-center px-0' : ''
          ].join(' ')}
          onClick={() => handleItemClick(item, hasChildren)}
          aria-expanded={hasChildren ? isExpanded : undefined}
          title={collapsed ? item.label : undefined} // 收起时用浏览器原生提示
        >
          <span className="shrink-0">{item.icon}</span>
          {!collapsed && <span className="flex-1 ml-3">{item.label}</span>}
          {hasChildren && !collapsed && (
            <svg
              className={`w-5 h-5 transition-transform ${isExpanded ? 'rotate-180' : ''}`}
              viewBox="0 0 24 24"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path d="M6 9l6 6 6-6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          )}
        </button>

        {/* 收起时不显示子菜单 */}
        {hasChildren && isExpanded && !collapsed && (
          <ul className="ml-4 border-l border-gray-200 pl-4 mt-1 mb-1">
            {item.children?.map(child => (
              <li key={child.id}>
                <button
                  className={`flex items-center w-full px-4 py-2 text-left text-sm ${activePage === child.id ? 'text-blue-500 font-medium' : 'text-gray-700 hover:text-blue-500'
                    }`}
                  onClick={() => onNavigate(child.id)}
                >
                  <span className="shrink-0">{child.icon}</span>
                  <span className="ml-2">{child.label}</span>
                </button>
              </li>
            ))}
          </ul>
        )}
      </li>
    );
  };

  return (
    <div
      className={[
        collapsed ? 'w-16' : 'w-56',
        'bg-white border-r border-gray-200 flex flex-col h-full transition-[width] duration-200 whitespace-nowrap'
      ].join(' ')}
    >
      <div className="p-4 border-b border-gray-200">
        <div className={`flex items-center ${collapsed ? 'justify-center' : ''}`}>
          <img src={logo} alt="系统图标" className="w-8 h-8" />
          {!collapsed && <span className="ml-2 font-bold text-xl">{title}</span>}
        </div>
      </div>

      <div className="flex-1 overflow-y-auto">
        <ul className="py-2 space-y-1">
          {menuItems.map(renderMenuItem)}
        </ul>
      </div>

      {/* 底部折叠/展开开关 */}
      <div className="p-4 border-t border-gray-200 flex items-center justify-center cursor-pointer hover:bg-gray-100" onClick={() => setCollapsed(prev => !prev)}>
        <svg
          className={`w-5 h-5 text-gray-600 transition-transform ${collapsed ? 'rotate-180' : ''}`}
          viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"
        >
          {/* 复用你的图标路径：左右箭头形态，旋转表示方向 */}
          <path d="M22 11.9299H2" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"></path>
          <path d="M8.00009 19L2.84009 14C2.5677 13.7429 2.35071 13.433 2.20239 13.0891C2.05407 12.7452 1.97754 12.3745 1.97754 12C1.97754 11.6255 2.05407 11.2548 2.20239 10.9109C2.35071 10.567 2.5677 10.2571 2.84009 10L8.00009 5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"></path>
        </svg>
      </div>
    </div>
  );
};

export default Sidebar;
