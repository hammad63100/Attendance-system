import { useState, useEffect } from 'react';
import { NavLink, Outlet, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import {
    LayoutDashboard,
    Server,
    FileText,
    Activity,
    LogOut,
    Menu,
    X,
    UserCircle
} from 'lucide-react';

import './Layout.css';

export const Layout = () => {
    const { logout } = useAuth();
    const navigate = useNavigate();
    const [isSidebarOpen, setIsSidebarOpen] = useState(true);
    const [time, setTime] = useState(new Date());

    useEffect(() => {
        const timer = setInterval(() => setTime(new Date()), 1000);
        return () => clearInterval(timer);
    }, []);

    const handleLogout = () => {
        logout();
        navigate('/login');
    };

    const navItems = [
        { path: '/', name: 'Dashboard', icon: <LayoutDashboard size={20} /> },
        { path: '/devices', name: 'Devices', icon: <Server size={20} /> },
        { path: '/attendance', name: 'Attendance', icon: <FileText size={20} /> },
        { path: '/students', name: 'Students', icon: <UserCircle size={20} /> },
        { path: '/simulator', name: 'Log Simulator', icon: <Activity size={20} /> },
    ];

    return (
        <div className="app-layout">
            {/* Sidebar */}
            <aside className={`sidebar glass-panel ${isSidebarOpen ? 'open' : 'closed'}`}>
                <div className="sidebar-header">
                    <div className="logo-icon pulse-glow-animation"></div>
                    {isSidebarOpen && <h2>BioSync</h2>}
                </div>

                <nav className="sidebar-nav">
                    {navItems.map((item, index) => (
                        <NavLink
                            key={item.path}
                            to={item.path}
                            className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}
                            style={{ animationDelay: `${index * 0.1}s` }}
                        >
                            <div className="nav-icon">{item.icon}</div>
                            {isSidebarOpen && <span className="nav-text">{item.name}</span>}
                        </NavLink>
                    ))}
                </nav>

                <div className="sidebar-footer">
                    <button className="logout-button nav-item" onClick={handleLogout}>
                        <div className="nav-icon"><LogOut size={20} /></div>
                        {isSidebarOpen && <span className="nav-text">Sign Out</span>}
                    </button>
                </div>
            </aside>

            {/* Main Content */}
            <main className={`main-content ${isSidebarOpen ? 'sidebar-open' : 'sidebar-closed'}`}>
                <header className="top-header glass-panel">
                    <div className="header-left">
                        <button
                            className="toggle-button"
                            onClick={() => setIsSidebarOpen(!isSidebarOpen)}
                        >
                            {isSidebarOpen ? <X size={24} /> : <Menu size={24} />}
                        </button>
                        <div className="breadcrumbs">
                            <span className="text-muted">Home</span>
                            <span className="separator">/</span>
                            <span className="text-main">
                                {navItems.find(i => window.location.pathname === i.path ||
                                    (window.location.pathname.startsWith(i.path) && i.path !== '/'))?.name || 'Dashboard'}
                            </span>
                        </div>
                    </div>

                    <div className="header-right">
                        <div className="clock glass-panel">
                            {time.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
                        </div>
                        <div className="user-profile">
                            <UserCircle size={32} className="text-secondary" />
                            <div className="user-details">
                                <span className="user-name">Admin User</span>
                                <span className="user-role">Administrator</span>
                            </div>
                        </div>
                    </div>
                </header>

                <div className="page-container animate-fade-in-delayed">
                    <Outlet />
                </div>
            </main>
        </div>
    );
};
