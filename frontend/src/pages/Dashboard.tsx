import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { Users, Server, Activity, ShieldCheck } from 'lucide-react';

export const Dashboard = () => {
    const { token } = useAuth();
    const [stats, setStats] = useState({
        totalDevices: 0,
        onlineDevices: 0,
        totalAttendanceToday: 0,
        systemStatus: 'Optimal'
    });
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchDashboardData = async () => {
            try {
                // Fetch Devices
                const devRes = await fetch('http://localhost:3000/devices', {
                    headers: { Authorization: `Bearer ${token}` }
                });
                const devices = devRes.ok ? await devRes.json() : [];

                // Fetch Attendance
                const attRes = await fetch('http://localhost:3000/admin/attendance', {
                    headers: { Authorization: `Bearer ${token}` }
                });
                const attendance = attRes.ok ? await attRes.json() : [];

                // Count today's attendance
                const today = new Date().toISOString().split('T')[0];
                const todayAtt = attendance.filter((a: any) => new Date(a.date).toISOString().split('T')[0] === today);

                setStats({
                    totalDevices: devices.length,
                    onlineDevices: devices.filter((d: any) => d.status === 'ONLINE').length,
                    totalAttendanceToday: todayAtt.length,
                    systemStatus: devices.length > 0 && devices.every((d: any) => d.status === 'ONLINE') ? 'Optimal' : 'Checking'
                });
            } catch (err) {
                console.error("Dashboard fetch error", err);
            } finally {
                setLoading(false);
            }
        };
        fetchDashboardData();
    }, [token]);

    if (loading) return <div className="flex-center h-full"><Activity className="animate-spin text-primary" size={32} /></div>;

    return (
        <div className="p-6 h-full flex flex-col gap-6">
            <div>
                <h1 className="text-2xl font-bold text-main mb-2">Dashboard Overview</h1>
                <p className="text-muted">Welcome to the BioSync Admin Panel. Here is today's system status.</p>
            </div>

            <div className="grid animate-fade-in" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '20px' }}>
                <div className="glass-panel p-6 flex flex-col gap-4">
                    <div className="flex justify-between items-center">
                        <span className="text-muted">Total Devices</span>
                        <Server className="text-primary" size={24} />
                    </div>
                    <h2 className="text-3xl font-bold text-main">{stats.totalDevices}</h2>
                </div>

                <div className="glass-panel p-6 flex flex-col gap-4">
                    <div className="flex justify-between items-center">
                        <span className="text-muted">Online Devices</span>
                        <Activity className="text-success" size={24} />
                    </div>
                    <h2 className="text-3xl font-bold text-main">{stats.onlineDevices}</h2>
                </div>

                <div className="glass-panel p-6 flex flex-col gap-4">
                    <div className="flex justify-between items-center">
                        <span className="text-muted">Today's Activity</span>
                        <Users className="text-secondary" size={24} />
                    </div>
                    <h2 className="text-3xl font-bold text-main">{stats.totalAttendanceToday}</h2>
                </div>

                <div className="glass-panel p-6 flex flex-col gap-4">
                    <div className="flex justify-between items-center">
                        <span className="text-muted">System Health</span>
                        <ShieldCheck className={stats.systemStatus === 'Optimal' ? 'text-success' : 'text-warning'} size={24} />
                    </div>
                    <h2 className="text-3xl font-bold text-main">{stats.systemStatus}</h2>
                </div>
            </div>

            <div className="flex-1 glass-panel p-6 mt-4 flex-center flex-col gap-4 animate-fade-in-delayed" style={{ opacity: 0.7 }}>
                <Activity size={48} className="text-muted" />
                <p className="text-muted">Advanced analytics and charts will populate here as more logs sync.</p>
            </div>
        </div>
    );
};
