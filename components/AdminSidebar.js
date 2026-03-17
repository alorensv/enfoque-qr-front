import { useState } from 'react';

const menu = [
  { label: 'Dashboard', icon: '🏠', href: '/admin/home' },
  { label: 'Usuarios', icon: '👤', href: '/admin/usuarios' },
  { label: 'Equipos', icon: '🖥️', href: '/admin/equipos' },
  { label: 'Documentos', icon: '📄', href: '/admin/documents' },
  { label: 'Mantenciones', icon: '🛠️', href: '/admin/mantenciones' },
  { label: 'QR Universal', icon: '🔍', href: '/admin/qr-universal' },
];

export default function AdminSidebar({ isOpen, closeSidebar }) {
  const [isCollapsed, setIsCollapsed] = useState(false);

  return (
    <>
      {/* Overlay background for mobile */}
      <div 
        className={`fixed inset-0 bg-slate-900 bg-opacity-50 transition-opacity z-40 lg:hidden ${isOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'}`} 
        onClick={closeSidebar}
      />
      
      {/* Sidebar fixed on mobile, static/relative on large screens */}
      <aside 
        className={`fixed lg:relative inset-y-0 left-0 z-50 bg-slate-100 border-r border-slate-200 flex flex-col transition-[width,transform] duration-300 shadow-[4px_0_24px_rgba(0,0,0,0.08)] ${
          isCollapsed ? 'w-64 lg:w-20' : 'w-64'
        } ${isOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}`}
      >
        {/* Collapse Button (Desktop only) */}
        <div className="flex items-center p-4 lg:flex hidden justify-end border-b border-transparent">
          <button 
            onClick={() => setIsCollapsed(!isCollapsed)}
            className="p-1.5 rounded-lg text-slate-500 hover:text-slate-700 hover:bg-slate-200 transition-colors focus:ring-2 focus:ring-slate-300"
            title={isCollapsed ? "Expandir menú" : "Contraer menú"}
          >
            <svg 
              className={`w-5 h-5 transition-transform duration-300 ${isCollapsed ? 'rotate-180' : ''}`}
              fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}
            >
              <path strokeLinecap="round" strokeLinejoin="round" d="M11 19l-7-7 7-7m8 14l-7-7 7-7" />
            </svg>
          </button>
        </div>

        <div className={`flex flex-col gap-2 ${isCollapsed ? 'px-4 lg:px-2' : 'px-4'} pb-4 pt-4 lg:pt-2 overflow-y-auto overflow-x-hidden`}>
          {menu.map(item => (
            <a 
              key={item.href} 
              href={item.href} 
              className={`flex items-center rounded-lg text-slate-700 font-medium text-[1.05rem] hover:bg-indigo-100 hover:text-indigo-900 transition-all duration-300 group relative ${
                isCollapsed 
                  ? 'gap-3 px-4 py-3 lg:gap-0 lg:px-0 lg:py-0 lg:justify-center lg:w-12 lg:h-12 lg:mx-auto' 
                  : 'gap-3 px-4 py-3'
              }`}
            >
              <span className={`text-xl flex-shrink-0 flex items-center justify-center ${isCollapsed ? 'lg:w-full lg:h-full' : ''}`}>
                {item.icon}
              </span> 
              
              <span className={`whitespace-nowrap transition-all duration-300 overflow-hidden ${
                isCollapsed ? 'lg:max-w-0 lg:opacity-0' : 'max-w-[200px] opacity-100'
              }`}>
                {item.label}
              </span>
              
              {/* Tooltip on hover when collapsed (Desktop only) */}
              {isCollapsed && (
                <div className="hidden lg:block absolute left-full ml-3 px-3 py-2 bg-slate-800 text-white text-sm rounded-md opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap z-50 pointer-events-none shadow-lg">
                  {item.label}
                  <div className="absolute top-1/2 -translate-y-1/2 -left-1 border-t-4 border-b-4 border-r-4 border-transparent border-r-slate-800"></div>
                </div>
              )}
            </a>
          ))}
        </div>
      </aside>
    </>
  );
}
