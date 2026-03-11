import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { Users, Server, Activity, UserCheck, AlertCircle, Calendar } from 'lucide-react';
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer, Legend } from 'recharts';

export const Dashboard = () => {
    const { token } = useAuth();
    const [stats, setStats] = useState({
        totalStudents: 0,
        totalDevices: 0,
        todayStats: { present: 0, absent: 0, late: 0, leave: 0 },
        trend: []
    });
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchDashboardData = async () => {
            try {
                const res = await fetch('http://localhost:3000/admin/dashboard-stats', {
                    headers: { Authorization: `Bearer ${token}` }
                });
                if (res.ok) {
                    const data = await res.json();
                    setStats(data);
                }
            } catch (err) {
                console.error("Dashboard fetch error", err);
            } finally {
                setLoading(false);
            }
        };
        fetchDashboardData();
    }, [token]);

    if (loading) return <div className="flex-center h-full"><Activity className="animate-spin text-primary" size={32} /></div>;

    const todayTotal = stats.todayStats.present + stats.todayStats.absent + stats.todayStats.late + stats.todayStats.leave;
    const presentRatio = todayTotal > 0 ? ((stats.todayStats.present + stats.todayStats.late) / todayTotal) * 100 : 0;

    return (
        <div className="p-8 h-full flex flex-col gap-8" style={{ overflowY: 'auto' }}>
            <div className="flex justify-between items-end">
                <div>
                    <h1 className="text-3xl font-bold text-main mb-2">Dashboard Overview</h1>
                    <p className="text-muted">Real-time attendance analytics and system metrics.</p>
                </div>
            </div>

            <div className="grid animate-fade-in" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '24px' }}>
                <div className="glass-panel p-6 flex flex-col gap-4 transition-all hover:-translate-y-2 relative overflow-hidden group">
                    <div className="absolute inset-0 bg-gradient-to-br from-primary-light/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                    <div className="flex justify-between items-center">
                        <span className="text-muted">Total Students</span>
                        <div className="p-2 rounded-lg bg-primary/10">
                            <Users className="text-primary" size={24} />
                        </div>
                    </div>
                    <h2 className="text-4xl font-bold text-main z-10">{stats.totalStudents}</h2>
                </div>

                <div className="glass-panel p-6 flex flex-col gap-4 transition-all hover:-translate-y-2 relative overflow-hidden group">
                    <div className="absolute inset-0 bg-gradient-to-br from-success/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                    <div className="flex justify-between items-center z-10">
                        <span className="text-muted font-medium">Present Today</span>
                        <div className="p-2 rounded-lg bg-success/10">
                            <UserCheck className="text-success" size={24} />
                        </div>
                    </div>
                    <div className="flex items-end gap-3 z-10">
                        <h2 className="text-4xl font-bold text-main">{stats.todayStats.present + stats.todayStats.late}</h2>
                        <span className="text-sm text-warning mb-1 pb-1">{stats.todayStats.late} late</span>
                    </div>
                </div>

                <div className="glass-panel p-6 flex flex-col gap-4 transition-all hover:-translate-y-2 relative overflow-hidden group">
                    <div className="absolute inset-0 bg-gradient-to-br from-danger/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                    <div className="flex justify-between items-center z-10">
                        <span className="text-muted font-medium">Absent Today</span>
                        <div className="p-2 rounded-lg bg-danger/10">
                            <AlertCircle className="text-danger" size={24} />
                        </div>
                    </div>
                    <h2 className="text-4xl font-bold text-main z-10">{stats.todayStats.absent}</h2>
                </div>

                <div className="glass-panel p-6 flex flex-col gap-4 transition-all hover:-translate-y-2 relative overflow-hidden group">
                    <div className="absolute inset-0 bg-gradient-to-br from-warning/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                    <div className="flex justify-between items-center z-10">
                        <span className="text-muted font-medium">On Leave</span>
                        <div className="p-2 rounded-lg bg-warning/10">
                            <Calendar className="text-warning" size={24} />
                        </div>
                    </div>
                    <h2 className="text-4xl font-bold text-main z-10">{stats.todayStats.leave}</h2>
                </div>
            </div>

            <div className="grid lg:grid-cols-3 gap-8" style={{ minHeight: '400px' }}>
                <div className="glass-panel p-8 flex flex-col gap-6 lg:col-span-2 animate-fade-in-delayed relative overflow-hidden">
                    <div className="absolute top-0 right-0 w-64 h-64 bg-primary/5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/3"></div>
                    <h3 className="font-semibold text-xl z-10">Attendance Trends <span className="text-sm font-normal text-muted ml-2">Last 7 Days</span></h3>
                    <div className="flex-1 w-full z-10" style={{ minHeight: 0 }}>
                        <ResponsiveContainer width="100%" height="100%">
                            <AreaChart data={stats.trend} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                                <defs>
                                    <linearGradient id="colorPresent" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.6} />
                                        <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
                                    </linearGradient>
                                    <linearGradient id="colorAbsent" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="5%" stopColor="#ef4444" stopOpacity={0.6} />
                                        <stop offset="95%" stopColor="#ef4444" stopOpacity={0} />
                                    </linearGradient>
                                </defs>
                                <XAxis dataKey="date" stroke="#94a3b8" fontSize={13} tickLine={false} axisLine={false} dy={10} />
                                <YAxis stroke="#94a3b8" fontSize={13} tickLine={false} axisLine={false} tickFormatter={(value) => `${value}`} dx={-10} />
                                <Tooltip
                                    contentStyle={{ backgroundColor: 'rgba(26, 26, 39, 0.95)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '16px', color: '#f8fafc', backdropFilter: 'blur(12px)', boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.5)' }}
                                    itemStyle={{ color: '#f8fafc' }}
                                />
                                <Legend iconType="circle" wrapperStyle={{ paddingTop: '20px' }} />
                                <Area type="monotone" dataKey="present" stroke="#3b82f6" strokeWidth={4} fillOpacity={1} fill="url(#colorPresent)" name="Present & Late" activeDot={{ r: 6, strokeWidth: 0 }} />
                                <Area type="monotone" dataKey="absent" stroke="#ef4444" strokeWidth={4} fillOpacity={1} fill="url(#colorAbsent)" name="Absent" activeDot={{ r: 6, strokeWidth: 0 }} />
                            </AreaChart>
                        </ResponsiveContainer>
                    </div>
                </div>

                <div className="glass-panel p-8 flex flex-col gap-6 animate-fade-in-delayed lg:col-span-1">
                    <h3 className="font-semibold text-xl">Quick Status</h3>
                    <div className="flex flex-col gap-8 flex-1">
                        <div className="bg-dark/30 p-6 rounded-2xl border border-white/5">
                            <div className="flex justify-between items-end mb-4">
                                <span className="text-muted font-medium">Attendance Rate</span>
                                <span className="text-3xl font-bold text-gradient">{presentRatio.toFixed(1)}%</span>
                            </div>
                            <div className="w-full bg-darker rounded-full h-3">
                                <div className="bg-gradient-to-r from-primary-light to-secondary h-3 rounded-full transition-all duration-1000" style={{ width: `${presentRatio}%` }}></div>
                            </div>
                        </div>

                        <div className="mt-auto p-6 rounded-2xl border border-primary/20 bg-primary/10 flex items-center gap-5 relative overflow-hidden group">
                            <div className="absolute inset-0 bg-primary/5 group-hover:bg-primary/10 transition-colors"></div>
                            <div className="bg-primary/20 p-4 rounded-full relative z-10">
                                <Server className="text-primary" size={28} />
                                <div className="absolute top-0 right-0 w-3 h-3 bg-success rounded-full border-2 border-[#1a1a27]"></div>
                            </div>
                            <div className="relative z-10">
                                <h4 className="font-semibold text-muted">Active Devices</h4>
                                <p className="text-3xl font-bold mt-1 tracking-tight">{stats.totalDevices}</p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div >
    );
};
