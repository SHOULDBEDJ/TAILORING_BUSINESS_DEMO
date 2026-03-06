import React from 'react';
import { NavLink } from 'react-router-dom';
import {
    LayoutDashboard, PlusCircle, Search, ClipboardList,
    Scissors, X, LineChart
} from 'lucide-react';

const navItems = [
    { to: '/', icon: LayoutDashboard, label: 'Dashboard' },
    { to: '/new-order', icon: PlusCircle, label: 'New Order' },
    { to: '/search', icon: Search, label: 'Customer Search' },
    { to: '/orders', icon: ClipboardList, label: 'Order History' },
    { to: '/analytics', icon: LineChart, label: 'Analytics' },
];

export default function Sidebar({ isOpen, onClose }) {
    return (
        <aside className={`sidebar ${isOpen ? 'open' : ''}`}>
            {/* Mobile Close Button */}
            <button className="sidebar-close-btn" onClick={onClose}>
                <X size={20} />
            </button>
            {/* Logo */}
            <div className="sidebar-logo">
                <div className="logo-circle">LM</div>
                <span className="logo-name">L.M. Ladies Tailor</span>
                <span className="logo-tagline">Luxury in Every Stitch</span>
            </div>

            {/* Navigation */}
            <nav className="sidebar-nav">
                <p className="nav-section-title">Main Menu</p>
                {navItems.map(({ to, icon: Icon, label }) => (
                    <NavLink
                        key={to}
                        to={to}
                        className={({ isActive }) => `nav-link${isActive ? ' active' : ''}`}
                        end={to === '/'}
                        onClick={onClose} // Close sidebar on mobile after clicking a link
                    >
                        <Icon size={17} />
                        {label}
                    </NavLink>
                ))}
            </nav>

            {/* Footer info */}
            <div className="sidebar-footer">
                <Scissors size={14} style={{ display: 'inline', marginRight: 5 }} />
                Shop Billing System
                <br />v1.0 — 2026
            </div>
        </aside>
    );
}
