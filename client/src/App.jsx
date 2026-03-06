import React, { useState, useEffect } from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Sidebar from './components/Sidebar';
import { Toaster } from 'react-hot-toast';
import Dashboard from './pages/Dashboard';
import NewOrder from './pages/NewOrder';
import CustomerSearch from './pages/CustomerSearch';
import OrderHistory from './pages/OrderHistory';
import BillPreview from './pages/BillPreview';
import Analytics from './pages/Analytics';
import './index.css';
import { useRegisterSW } from 'virtual:pwa-register/react';

export default function App() {
  const [sidebarOpen, useState_sidebarOpen] = useState(false);
  const {
    needRefresh: [needRefresh, setNeedRefresh],
    updateServiceWorker,
  } = useRegisterSW();

  useEffect(() => {
    const handleOffline = () => {
      toast.error('You are offline. Changes will save locally and sync when reconnected.', { duration: 6000, id: 'net' });
    };
    const handleOnline = () => {
      toast.success('Back online! Syncing background changes...', { id: 'net' });
    };

    window.addEventListener('offline', handleOffline);
    window.addEventListener('online', handleOnline);

    return () => {
      window.removeEventListener('offline', handleOffline);
      window.removeEventListener('online', handleOnline);
    };
  }, []);

  const toggleSidebar = () => useState_sidebarOpen(!sidebarOpen);
  const closeSidebar = () => useState_sidebarOpen(false);

  return (
    <BrowserRouter>
      <Toaster position="top-center" />
      <div className={`app-layout ${sidebarOpen ? 'sidebar-open' : ''}`}>
        <Sidebar isOpen={sidebarOpen} onClose={closeSidebar} />

        {/* Mobile Overlay */}
        {sidebarOpen && <div className="mobile-overlay" onClick={closeSidebar}></div>}

        <main className="main-content">
          <Routes>
            <Route path="/" element={<Dashboard onMenuClick={toggleSidebar} />} />
            <Route path="/new-order" element={<NewOrder onMenuClick={toggleSidebar} />} />
            <Route path="/search" element={<CustomerSearch onMenuClick={toggleSidebar} />} />
            <Route path="/customer/:id" element={<CustomerSearch onMenuClick={toggleSidebar} />} />
            <Route path="/orders" element={<OrderHistory onMenuClick={toggleSidebar} />} />
            <Route path="/bill/:orderId" element={<BillPreview onMenuClick={toggleSidebar} />} />
            <Route path="/analytics" element={<Analytics onMenuClick={toggleSidebar} />} />
          </Routes>
        </main>
      </div>
    </BrowserRouter>
  );
}
