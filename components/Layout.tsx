import React, { useState, Fragment, useEffect } from 'react';
import { NavLink, Outlet, useLocation } from 'react-router-dom';
import { useAppContext } from '../context/AppContext';
import type { Notification as NotificationType } from '../types';

const DashboardIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
  <svg {...props} xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 6A2.25 2.25 0 016 3.75h2.25A2.25 2.25 0 0110.5 6v2.25a2.25 2.25 0 01-2.25 2.25H6a2.25 2.25 0 01-2.25-2.25V6zM3.75 15.75A2.25 2.25 0 016 13.5h2.25a2.25 2.25 0 012.25 2.25V18a2.25 2.25 0 01-2.25 2.25H6A2.25 2.25 0 013.75 18v-2.25zM13.5 6a2.25 2.25 0 012.25-2.25H18A2.25 2.25 0 0120.25 6v2.25A2.25 2.25 0 0118 10.5h-2.25a2.25 2.25 0 01-2.25-2.25V6zM13.5 15.75a2.25 2.25 0 012.25-2.25H18a2.25 2.25 0 012.25 2.25V18A2.25 2.25 0 0118 20.25h-2.25A2.25 2.25 0 0113.5 18v-2.25z" />
  </svg>
);

const UsersIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
  <svg {...props} xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" d="M15 19.128a9.38 9.38 0 002.625.372 9.337 9.337 0 004.121-.952 4.125 4.125 0 00-7.533-2.493M15 19.128v-.003c0-1.113-.285-2.16-.786-3.07M15 19.128v.106A12.318 12.318 0 018.624 21c-2.331 0-4.512-.645-6.374-1.766l-.001-.109a6.375 6.375 0 0111.964-4.663M12 6.375a3.375 3.375 0 11-6.75 0 3.375 3.375 0 016.75 0z" />
  </svg>
);

const ProductIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
    <svg {...props} xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" d="M20.25 7.5l-.625 10.632a2.25 2.25 0 01-2.247 2.118H6.622a2.25 2.25 0 01-2.247-2.118L3.75 7.5M10 11.25h4M3.375 7.5h17.25c.621 0 1.125-.504 1.125-1.125v-1.5c0-.621-.504-1.125-1.125-1.125H3.375c-.621 0-1.125.504-1.125 1.125v1.5c0 .621.504 1.125 1.125 1.125z" />
    </svg>
);

const BillingIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
    <svg {...props} xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 8.25h19.5M2.25 9h19.5m-16.5 5.25h6m-6 2.25h6m-3-3.75l-3 1.5m-3-1.5l3 1.5m-6-3l3-1.5m3 1.5l3-1.5M3 13.5l3-1.5m-3 1.5l3 1.5m12-3l3-1.5m-3 1.5l3 1.5M9 15l3-1.5m-3 1.5l3 1.5M12 12.75l-3 1.5m3-1.5l3 1.5M15 15l3-1.5m-3 1.5l3 1.5M9 12l3-1.5" />
    </svg>
);

const ReportsIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
    <svg {...props} xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 6a7.5 7.5 0 100 15 7.5 7.5 0 000-15z" />
        <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-5.197-5.197" />
    </svg>
);

const LogoutIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
  <svg {...props} xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 9V5.25A2.25 2.25 0 0013.5 3h-6a2.25 2.25 0 00-2.25 2.25v13.5A2.25 2.25 0 007.5 21h6a2.25 2.25 0 002.25-2.25V15m3 0l3-3m0 0l-3-3m3 3H9" />
  </svg>
);

const CloseAppIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
  <svg {...props} xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
  </svg>
);

const CheckCircleIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
    <svg {...props} xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
    </svg>
);
const ExclamationTriangleIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
    <svg {...props} xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z" />
    </svg>
);
const InformationCircleIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
    <svg {...props} xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" d="M11.25 11.25l.041-.02a.75.75 0 011.063.852l-.708 2.836a.75.75 0 001.063.853l.041-.021M21 12a9 9 0 11-18 0 9 9 0 0118 0zm-9-3.75h.008v.008H12V8.25z" />
    </svg>
);
const XCircleIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
    <svg {...props} xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" d="M9.75 9.75l4.5 4.5m0-4.5l-4.5 4.5M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
    </svg>
);

const notificationConfig = {
    success: { icon: CheckCircleIcon, classes: 'text-green-500' },
    warning: { icon: ExclamationTriangleIcon, classes: 'text-yellow-500' },
    error: { icon: XCircleIcon, classes: 'text-red-500' },
    info: { icon: InformationCircleIcon, classes: 'text-blue-500' },
};

const Notification: React.FC<{ notification: NotificationType; onDismiss: (id: string) => void }> = ({ notification, onDismiss }) => {
    const { type, message, id } = notification;
    const { icon: Icon, classes } = notificationConfig[type];

    useEffect(() => {
        const timer = setTimeout(() => onDismiss(id), 5000);
        return () => clearTimeout(timer);
    }, [id, onDismiss]);

    return (
        <div className="max-w-sm w-full bg-white shadow-lg rounded-lg pointer-events-auto ring-1 ring-black ring-opacity-5 overflow-hidden">
            <div className="p-4">
                <div className="flex items-start">
                    <div className="flex-shrink-0">
                        <Icon className={`h-6 w-6 ${classes}`} aria-hidden="true" />
                    </div>
                    <div className="ml-3 w-0 flex-1 pt-0.5">
                        <p className="text-sm font-medium text-gray-900">{message}</p>
                    </div>
                    <div className="ml-4 flex-shrink-0 flex">
                        <button onClick={() => onDismiss(id)} className="bg-white rounded-md inline-flex text-gray-400 hover:text-gray-500 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500">
                            <span className="sr-only">Close</span>
                            <svg className="h-5 w-5" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true"><path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" /></svg>
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

const NotificationContainer: React.FC = () => {
    const { notifications, removeNotification } = useAppContext();
    return (
        <div aria-live="assertive" className="fixed inset-0 flex items-end px-4 py-6 pointer-events-none sm:p-6 sm:items-start z-50">
            <div className="w-full flex flex-col items-center space-y-4 sm:items-end">
                {notifications.map((notification) => (
                    <Notification key={notification.id} notification={notification} onDismiss={removeNotification} />
                ))}
            </div>
        </div>
    );
};

const navItems = [
  { path: '/dashboard', label: 'Dashboard', icon: DashboardIcon },
  { path: '/buyers', label: 'Buyers', icon: UsersIcon },
  { path: '/products', label: 'Products', icon: ProductIcon },
  { path: '/billing', label: 'Billing', icon: BillingIcon },
  { path: '/reports', label: 'Reports', icon: ReportsIcon },
];

const Sidebar: React.FC = () => {
  const { logout } = useAppContext();
  
  const handleCloseApp = () => {
    alert("This action will attempt to close the application tab. Due to browser security, this may not work.");
    window.close();
  };

  return (
    <aside className="w-64 bg-slate-900 text-slate-300 flex flex-col fixed h-full">
      <div className="h-16 flex items-center px-6 text-2xl font-bold text-white tracking-wider border-b border-slate-800">
        <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 mr-2 text-primary-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
        </svg>
        ProBill
      </div>
      <nav className="flex-1 px-4 py-6 space-y-2">
        {navItems.map(({ path, label, icon: Icon }) => (
            <NavLink
              key={path}
              to={path}
              className={({ isActive }) =>
                `group flex items-center px-3 py-2.5 text-sm font-medium rounded-md transition-colors duration-200 relative ${
                  isActive
                    ? 'bg-slate-800 text-white'
                    : 'text-slate-400 hover:bg-slate-700 hover:text-white'
                }`
              }
            >
              {({ isActive }) => (
                <>
                  <div className={`absolute left-0 h-6 w-1 rounded-r-lg ${isActive ? 'bg-primary-500' : 'bg-transparent transition-transform group-hover:scale-y-100'}`}></div>
                  <Icon className="w-5 h-5 mr-3" />
                  <span>{label}</span>
                </>
              )}
            </NavLink>
        ))}
      </nav>
      <div className="px-4 py-4 border-t border-slate-800 space-y-2">
        <button
            onClick={logout}
            className="group flex items-center w-full px-3 py-2.5 text-sm font-medium rounded-md text-slate-400 hover:bg-slate-700 hover:text-white transition-colors duration-200"
        >
            <LogoutIcon className="w-5 h-5 mr-3" />
            <span>Logout</span>
        </button>
        <button
            onClick={handleCloseApp}
            className="group flex items-center w-full px-3 py-2.5 text-sm font-medium rounded-md text-slate-400 hover:bg-slate-700 hover:text-white transition-colors duration-200"
        >
            <CloseAppIcon className="w-5 h-5 mr-3" />
            <span>Close Application</span>
        </button>
      </div>
    </aside>
  );
};

const Header: React.FC = () => {
  const location = useLocation();
  const pageTitle = navItems.find(item => location.pathname.startsWith(item.path))?.label || 'Dashboard';

  return (
    <header className="bg-white border-b border-gray-200 h-16 flex items-center justify-between px-8">
      <h1 className="text-xl font-semibold text-gray-800">{pageTitle}</h1>
      <div className="flex items-center space-x-4">
         <div className="relative">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-gray-500 hover:text-gray-700 cursor-pointer" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
            </svg>
            <span className="absolute -top-1 -right-1 flex h-3 w-3">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-3 w-3 bg-red-500"></span>
            </span>
          </div>
          <div className="w-9 h-9 bg-slate-200 rounded-full flex items-center justify-center text-slate-600 font-semibold text-sm">
            A
          </div>
      </div>
    </header>
  );
};

const Layout: React.FC = () => {
  return (
    <div className="flex h-screen bg-gray-100">
      <Sidebar />
      <div className="flex-1 flex flex-col overflow-hidden ml-64">
        <Header />
        <main className="flex-1 overflow-x-hidden overflow-y-auto bg-gray-100">
          <div className="container mx-auto px-6 py-8">
            <Outlet />
          </div>
        </main>
      </div>
      <NotificationContainer />
    </div>
  );
};

export default Layout;
