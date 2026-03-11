import { useState, useEffect, useRef } from 'react';
import { useAuth } from '../context/AuthContext';
import { FileText, Download, Filter, Calendar, User, Clock, AlertCircle, RefreshCw, UserPlus } from 'lucide-react';
import './Attendance.css';

interface AttendanceRecord {
    id: string;
    userId: string;
    date: string;
    firstCheckIn: string;
    lastCheckOut: string;
    status: string;
    minutesLate: number;
}

export const Attendance = () => {
    const { token } = useAuth();
    const [records, setRecords] = useState<AttendanceRecord[]>([]);
    const [subjects, setSubjects] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [exportingPdf, setExportingPdf] = useState(false);
    const [exportingExcel, setExportingExcel] = useState(false);
    const [filters, setFilters] = useState({ date: '', userId: '', subjectId: '' });

    // Leave State
    const [leaveData, setLeaveData] = useState({ userId: '', date: '' });
    const [markingLeave, setMarkingLeave] = useState(false);

    // Live Auto-Refresh State
    const [isLive, setIsLive] = useState(false);
    const liveIntervalRef = useRef<number | null>(null);

    useEffect(() => {
        const fetchSubjects = async () => {
            try {
                const response = await fetch('http://localhost:3000/admin/subjects', {
                    headers: { Authorization: `Bearer ${token}` }
                });
                if (response.ok) {
                    setSubjects(await response.json());
                }
            } catch (err) {
                console.error("Failed to fetch subjects", err);
            }
        };
        fetchSubjects();
    }, [token]);

    const fetchAttendance = async () => {
        setLoading(true);
        try {
            const queryParams = new URLSearchParams();
            if (filters.date) queryParams.append('date', filters.date);
            if (filters.userId) queryParams.append('userId', filters.userId);
            if (filters.subjectId) queryParams.append('subjectId', filters.subjectId);

            const response = await fetch(`http://localhost:3000/admin/attendance?${queryParams}`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            const data = await response.json();
            setRecords(Array.isArray(data) ? data : []);
        } catch (err) {
            console.error("Failed to fetch attendance records", err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchAttendance();
    }, [filters, token]);

    useEffect(() => {
        if (isLive) {
            fetchAttendance(); // Fetch immediately when toggled on
            liveIntervalRef.current = window.setInterval(() => {
                fetchAttendance();
            }, 5000); // Poll every 5 seconds
        } else {
            if (liveIntervalRef.current) {
                clearInterval(liveIntervalRef.current);
            }
        }
        return () => {
            if (liveIntervalRef.current) clearInterval(liveIntervalRef.current);
        };
    }, [isLive, filters, token]);

    const handleExportPdf = async () => {
        setExportingPdf(true);
        try {
            const queryParams = new URLSearchParams();
            if (filters.date) queryParams.append('date', filters.date);
            if (filters.userId) queryParams.append('userId', filters.userId);
            if (filters.subjectId) queryParams.append('subjectId', filters.subjectId);

            const response = await fetch(`http://localhost:3000/admin/attendance/export?${queryParams}`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            const data = await response.json();

            setTimeout(() => {
                alert(`Export successful! Record count: ${data.recordCount}`);
                setExportingPdf(false);
            }, 1000);
        } catch (err) {
            console.error("Failed to export PDF", err);
            setExportingPdf(false);
        }
    };

    const handleExportExcel = async () => {
        setExportingExcel(true);
        try {
            const queryParams = new URLSearchParams();
            if (filters.date) queryParams.append('date', filters.date);
            if (filters.userId) queryParams.append('userId', filters.userId);
            if (filters.subjectId) queryParams.append('subjectId', filters.subjectId);

            const response = await fetch(`http://localhost:3000/admin/attendance/export-excel?${queryParams}`, {
                headers: { Authorization: `Bearer ${token}` }
            });

            const blob = await response.blob();
            const url = window.URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = `attendance-report-${new Date().toISOString().split('T')[0]}.xlsx`;
            document.body.appendChild(a);
            a.click();
            a.remove();

            setExportingExcel(false);
        } catch (err) {
            console.error("Failed to export Excel", err);
            setExportingExcel(false);
        }
    };

    const handleMarkLeave = async () => {
        if (!leaveData.userId || !leaveData.date) {
            alert('Please provide both User ID and Date');
            return;
        }
        setMarkingLeave(true);
        try {
            const response = await fetch(`http://localhost:3000/admin/attendance/leave`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${token}`
                },
                body: JSON.stringify(leaveData)
            });

            if (response.ok) {
                alert('Leave marked successfully');
                setLeaveData({ userId: '', date: '' });
                fetchAttendance();
            } else {
                const err = await response.json();
                alert(`Error: ${err.message}`);
            }
        } catch (err) {
            console.error("Failed to mark leave", err);
            alert('Failed to mark leave');
        } finally {
            setMarkingLeave(false);
        }
    };

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'PRESENT': return 'status-present';
            case 'LATE': return 'status-late';
            case 'ABSENT': return 'status-absent';
            case 'LEAVE': return 'status-leave';
            default: return 'status-default';
        }
    };

    const formatTime = (dateString: string) => {
        if (!dateString) return '--:--';
        return new Date(dateString).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    };

    return (
        <div className="attendance-container page-container">
            <div className="page-header">
                <div>
                    <div className="flex items-center gap-3 mb-2">
                        <h1 className="text-3xl font-bold text-main">Attendance Reports</h1>
                        <button 
                            className={`px-3 py-1 rounded-full text-xs font-bold flex items-center gap-2 border transition-colors ${isLive ? 'bg-success/20 text-success border-success/30' : 'bg-dark/50 text-muted border-white/10 hover:bg-white/5'}`}
                            onClick={() => setIsLive(!isLive)}
                        >
                            <span className="relative flex h-2 w-2">
                                {isLive && <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-success opacity-75"></span>}
                                <span className={`relative inline-flex rounded-full h-2 w-2 ${isLive ? 'bg-success' : 'bg-muted'}`}></span>
                            </span>
                            {isLive ? 'Live Updates ON' : 'Live Updates OFF'}
                        </button>
                    </div>
                    <p className="text-muted">View, filter, and export biometric attendance logs.</p>
                </div>
                <div className="flex gap-4">
                    <button
                        className={`btn-glass flex items-center justify-center gap-2 ${exportingExcel ? 'exporting' : ''}`}
                        onClick={handleExportExcel}
                        disabled={exportingExcel || records.length === 0}
                    >
                        {exportingExcel ? <><RefreshCw size={18} className="animate-spin" /> ...</> : <><Download size={18} /> Excel</>}
                    </button>
                    <button
                        className={`btn-primary flex items-center justify-center gap-2 ${exportingPdf ? 'exporting' : ''}`}
                        onClick={handleExportPdf}
                        disabled={exportingPdf || records.length === 0}
                    >
                        {exportingPdf ? <><RefreshCw size={18} className="animate-spin" /> ...</> : <><Download size={18} /> PDF</>}
                    </button>
                </div>
            </div>

            <div className="filters-card glass-panel animate-fade-in mt-4">
                <div className="filter-header">
                    <Filter size={20} className="text-primary" />
                    <h3>Filter Records</h3>
                </div>
                <div className="filters-grid">
                    <div className="filter-group">
                        <label>Date</label>
                        <div className="input-with-icon">
                            <input
                                type="date"
                                className="glass-input"
                                value={filters.date}
                                onChange={e => setFilters({ ...filters, date: e.target.value })}
                            />
                            <Calendar size={16} />
                        </div>
                    </div>
                    <div className="filter-group">
                        <label>Class/Subject</label>
                        <select
                            className="glass-input"
                            value={filters.subjectId}
                            onChange={e => setFilters({ ...filters, subjectId: e.target.value })}
                        >
                            <option value="">All Classes</option>
                            {subjects.map(sub => (
                                <option key={sub.id} value={sub.id}>{sub.name} ({sub.code})</option>
                            ))}
                        </select>
                    </div>
                    <div className="filter-group">
                        <label>Student/User ID</label>
                        <div className="input-with-icon">
                            <input
                                type="text"
                                className="glass-input"
                                placeholder="Search by ID..."
                                value={filters.userId}
                                onChange={e => setFilters({ ...filters, userId: e.target.value })}
                            />
                            <User size={16} />
                        </div>
                    </div>
                    <div className="flex items-end">
                        <button
                            className="btn-glass w-full"
                            style={{ height: '52px' }}
                            onClick={() => setFilters({ date: '', userId: '', subjectId: '' })}
                        >
                            Reset Filters
                        </button>
                    </div>
                </div>
            </div>

            <div className="glass-panel animate-fade-in p-8 mt-4 relative overflow-hidden group">
                <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                <div className="relative z-10">
                    <div className="flex items-center gap-3 mb-4">
                        <div className="p-2 rounded-lg bg-primary/10">
                            <UserPlus size={20} className="text-primary" />
                        </div>
                        <h3 className="font-semibold text-xl text-main">Mark Leave</h3>
                    </div>
                    <p className="text-muted text-sm mb-6">Manually mark a student on leave for a specific date.</p>

                <form
                    className="filters-grid"
                    onSubmit={(e) => { e.preventDefault(); handleMarkLeave(); }}
                >
                    <div className="filter-group">
                        <label>Student System ID</label>
                        <input
                            required
                            className="glass-input"
                            type="text"
                            placeholder="e.g. STU-001"
                            value={leaveData.userId}
                            onChange={e => setLeaveData({ ...leaveData, userId: e.target.value })}
                        />
                    </div>
                    <div className="filter-group">
                        <label>Leave Date</label>
                        <div className="input-with-icon">
                            <input
                                required
                                className="glass-input"
                                type="date"
                                value={leaveData.date}
                                onChange={e => setLeaveData({ ...leaveData, date: e.target.value })}
                            />
                            <Calendar size={16} />
                        </div>
                    </div>
                    <div className="flex items-end gap-4">
                        <button
                            type="button"
                            className="btn-glass flex-1"
                            style={{ height: '52px' }}
                            onClick={() => setLeaveData({ userId: '', date: '' })}
                            disabled={markingLeave}
                        >
                            Clear
                        </button>
                        <button
                            type="submit"
                            className="btn-primary flex-1 shadow-lg shadow-primary/20"
                            style={{ height: '52px' }}
                            disabled={markingLeave}
                        >
                            {markingLeave ? 'Saving...' : 'Mark Leave'}
                        </button>
                    </div>
                </form>
                </div>
            </div>

            <div className="table-container glass-panel animate-fade-in-delayed mt-4">
                {loading ? (
                    <div className="flex-center p-8 h-full min-h-[300px]">
                        <FileText className="animate-pulse text-primary" size={48} />
                    </div>
                ) : records.length === 0 ? (
                    <div className="empty-state flex flex-col items-center justify-center p-12 min-h-[300px]">
                        <AlertCircle size={48} className="text-muted mb-4" />
                        <h3 className="text-xl font-semibold mb-2">No Records Found</h3>
                        <p className="text-muted">Try adjusting your filters or date range.</p>
                    </div>
                ) : (
                    <div className="w-full h-full overflow-y-auto">
                        <table className="attendance-table">
                            <thead>
                                <tr>
                                    <th>Date</th>
                                    <th>User ID</th>
                                    <th>Check In</th>
                                    <th>Check Out</th>
                                    <th>Lateness</th>
                                    <th>Status</th>
                                </tr>
                            </thead>
                            <tbody>
                                {records.map((record, index) => (
                                    <tr
                                        key={record.id}
                                        style={{ animationDelay: `${index * 0.05}s` }}
                                        className="table-row-animate"
                                    >
                                        <td>{new Date(record.date).toLocaleDateString()}</td>
                                        <td className="font-mono text-primary font-semibold">{record.userId}</td>
                                        <td>
                                            <div className="time-cell">
                                                <Clock size={16} className="text-muted" />
                                                {formatTime(record.firstCheckIn)}
                                            </div>
                                        </td>
                                        <td>
                                            <div className="time-cell">
                                                <Clock size={16} className="text-muted" />
                                                {formatTime(record.lastCheckOut)}
                                            </div>
                                        </td>
                                        <td>
                                            {record.minutesLate > 0 ? (
                                                <span className="text-danger font-semibold">+{record.minutesLate} mins</span>
                                            ) : (
                                                <span className="text-muted">-</span>
                                            )}
                                        </td>
                                        <td>
                                            <span className={`status-pill ${getStatusColor(record.status)}`}>
                                                {record.status}
                                            </span>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>
        </div >
    );
};
