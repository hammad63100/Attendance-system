import { useState, useEffect } from 'react';
import type { FormEvent } from 'react';
import { useAuth } from '../context/AuthContext';
import { Activity, Send, Server, UserCheck, RefreshCw } from 'lucide-react';

export const Simulator = () => {
    const { token } = useAuth();
    const [devices, setDevices] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [sending, setSending] = useState(false);

    // Simulator form state
    const [selectedDevice, setSelectedDevice] = useState('');
    const [userId, setUserId] = useState('');
    const [logCount, setLogCount] = useState(1);
    const [logsList, setLogsList] = useState<any[]>([]);

    useEffect(() => {
        const fetchDevices = async () => {
            try {
                const response = await fetch('http://localhost:3000/devices', {
                    headers: { Authorization: `Bearer ${token}` }
                });
                const data = await response.json();
                setDevices(data);
                if (data.length > 0) setSelectedDevice(data[0].id);
            } catch (err) {
                console.error(err);
            } finally {
                setLoading(false);
            }
        };
        fetchDevices();
    }, [token]);

    const handleSimulate = async (e: FormEvent) => {
        e.preventDefault();
        if (!selectedDevice || !userId) return alert('Select a device and user ID');

        setSending(true);

        // Generate dummy logs
        const newLogs = Array.from({ length: logCount }).map(() => ({
            userId: userId,
            timestamp: new Date(Date.now() - Math.random() * 86400000).toISOString(), // Random time in last 24h
            verifyType: 'finger',
            inOut: Math.random() > 0.5 ? 'IN' : 'OUT'
        }));

        try {
            const response = await fetch(`http://localhost:3000/logs/upload/${selectedDevice}`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${token}`
                },
                body: JSON.stringify({ logs: newLogs })
            });

            if (response.ok) {
                const result = await response.json();
                setLogsList(prev => [...newLogs.map(l => ({ ...l, status: 'Success' })), ...prev].slice(0, 10)); // Keep last 10
                alert(result.message);
            } else {
                throw new Error('Upload failed');
            }
        } catch (err) {
            alert('Simulation failed. Check console.');
        } finally {
            setSending(false);
        }
    };

    if (loading) return <div className="flex-center h-full"><RefreshCw className="animate-spin text-primary" size={32} /></div>;

    return (
        <div className="attendance-container flex gap-6 h-full p-6">
            <div className="flex-1 flex flex-col gap-6">
                <div className="page-header">
                    <div>
                        <h1>Log Simulator</h1>
                        <p className="text-muted">Simulate biometric devices pushing raw logs to the backend via REST.</p>
                    </div>
                </div>

                <div className="glass-panel p-6 w-full max-w-lg">
                    <form onSubmit={handleSimulate} className="flex flex-col gap-6">
                        <div className="filter-group">
                            <label className="text-sm font-semibold text-muted mb-2 block">Target Device</label>
                            <div className="input-with-icon">
                                <Server size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-muted" />
                                <select
                                    value={selectedDevice}
                                    onChange={e => setSelectedDevice(e.target.value)}
                                    className="glass-input w-full pl-11 cursor-pointer appearance-none"
                                >
                                    <option value="" disabled>Select a device</option>
                                    {devices.map(d => <option key={d.id} value={d.id} className="bg-darker">{d.name} ({d.ip})</option>)}
                                </select>
                            </div>
                        </div>

                        <div className="filter-group">
                            <label className="text-sm font-semibold text-muted mb-2 block">Simulated User ID</label>
                            <div className="input-with-icon">
                                <UserCheck size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-muted" />
                                <input
                                    type="text"
                                    required
                                    className="glass-input w-full pl-11"
                                    placeholder="e.g. 101, 102..."
                                    value={userId}
                                    onChange={e => setUserId(e.target.value)}
                                />
                            </div>
                        </div>

                        <div className="filter-group">
                            <label className="text-sm font-semibold text-muted mb-2 block">Number of Logs to Generate</label>
                            <div className="input-with-icon">
                                <Activity size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-muted" />
                                <input
                                    type="number"
                                    min="1" max="50"
                                    className="glass-input w-full pl-11"
                                    value={logCount}
                                    onChange={e => setLogCount(parseInt(e.target.value) || 1)}
                                />
                            </div>
                        </div>

                        <button
                            type="submit"
                            className={`btn-primary mt-4 flex items-center justify-center gap-2 py-3 ${sending ? 'opacity-70 pointer-events-none' : ''}`}
                            disabled={sending || devices.length === 0}
                        >
                            {sending ? <RefreshCw className="animate-spin" size={20} /> : <Send size={20} />}
                            Push Raw Logs
                        </button>
                    </form>
                </div>
            </div>

            <div className="w-1/3 glass-panel p-6 flex flex-col gap-4">
                <h3 className="font-semibold text-lg flex items-center gap-2 text-main">
                    <Activity size={20} className="text-secondary" /> Recent Transmissions
                </h3>
                <div className="flex-1 overflow-y-auto pr-2 flex flex-col gap-3">
                    {logsList.length === 0 ? (
                        <p className="text-muted text-sm text-center mt-10">No simulated logs sent yet during this session.</p>
                    ) : (
                        logsList.map((log, i) => (
                            <div key={i} className="animate-fade-in text-sm" style={{ padding: '16px', borderRadius: '12px', border: '1px solid rgba(255,255,255,0.08)', background: 'rgba(255,255,255,0.03)' }}>
                                <div className="flex justify-between mb-2">
                                    <span className="font-mono text-primary font-semibold">User: {log.userId}</span>
                                    <span className="text-xs text-muted font-bold tracking-wider">[{log.inOut}]</span>
                                </div>
                                <div className="text-xs text-muted flex justify-between items-center">
                                    <span>{new Date(log.timestamp).toLocaleString()}</span>
                                    <span className="text-success font-semibold px-2 py-1 bg-green-500/10 rounded-md">{log.status}</span>
                                </div>
                            </div>
                        ))
                    )}
                </div>
            </div>
        </div>
    );
};
