import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { FileText, Download, Filter, Search, Calendar, User, Clock, AlertCircle } from 'lucide-react';
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
    const [loading, setLoading] = useState(true);
    const [exporting, setExporting] = useState(false);
    const [filters, setFilters] = useState({ date: '', userId: '' });

    const fetchAttendance = async () => {
        setLoading(true);
        try {
            const queryParams = new URLSearchParams();
            if (filters.date) queryParams.append('date', filters.date);
            if (filters.userId) queryParams.append('userId', filters.userId);

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
    }, [filters]);

    const handleExport = async () => {
        setExporting(true);
        try {
            const queryParams = new URLSearchParams();
            if (filters.date) queryParams.append('date', filters.date);
            if (filters.userId) queryParams.append('userId', filters.userId);

            const response = await fetch(`http://localhost:3000/admin/attendance/export?${queryParams}`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            const data = await response.json();

            // Simulate download
            setTimeout(() => {
                alert(`Export successful! Record count: ${data.recordCount}`);
                setExporting(false);
            }, 1500);

        } catch (err) {
            console.error("Failed to export", err);
            setExporting(false);
        }
    };

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'PRESENT': return 'status-present';
            case 'LATE': return 'status-late';
            case 'ABSENT': return 'status-absent';
            default: return 'status-default';
        }
    };

    const formatTime = (dateString: string) => {
        if (!dateString) return '--:--';
        return new Date(dateString).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    };

    return (
        <div className="attendance-container">
            <div className="page-header">
                <div>
                    <h1>Attendance Reports</h1>
                    <p className="text-muted">View, filter, and export biometric attendance logs.</p>
                </div>
                <button
                    className={`btn btn-primary export-btn ${exporting ? 'exporting' : ''}`}
                    onClick={handleExport}
                    disabled={exporting || records.length === 0}
                >
                    {exporting ? (
                        <><RefreshCw size={18} className="animate-spin" /> Generating PDF...</>
                    ) : (
                        <><Download size={18} /> Export PDF</>
                    )}
                </button>
            </div>

            <div className="filters-card glass-panel animate-fade-in">
                <div className="filter-header">
                    <Filter size={20} className="text-primary" />
                    <h3>Filter Records</h3>
                </div>
                <div className="filters-grid">
                    <div className="filter-group">
                        <label>Date</label>
                        <div className="input-with-icon">
                            <Calendar size={16} />
                            <input
                                type="date"
                                value={filters.date}
                                onChange={e => setFilters({ ...filters, date: e.target.value })}
                            />
                        </div>
                    </div>
                    <div className="filter-group">
                        <label>Student/User ID</label>
                        <div className="input-with-icon">
                            <User size={16} />
                            <input
                                type="text"
                                placeholder="Search by ID..."
                                value={filters.userId}
                                onChange={e => setFilters({ ...filters, userId: e.target.value })}
                            />
                        </div>
                    </div>
                    <div className="filter-actions">
                        <button className="btn btn-secondary" onClick={() => setFilters({ date: '', userId: '' })}>
                            Reset
                        </button>
                        <button className="btn btn-primary" onClick={fetchAttendance}>
                            <Search size={16} /> Search
                        </button>
                    </div>
                </div>
            </div>

            <div className="table-container glass-panel animate-fade-in-delayed">
                {loading ? (
                    <div className="flex-center p-8">
                        <FileText className="animate-pulse text-primary" size={48} />
                    </div>
                ) : records.length === 0 ? (
                    <div className="empty-state">
                        <AlertCircle size={48} className="text-muted mb-4" />
                        <h3>No Records Found</h3>
                        <p className="text-muted">Try adjusting your filters or date range.</p>
                    </div>
                ) : (
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
                                    <td className="font-mono">{record.userId}</td>
                                    <td>
                                        <div className="time-cell">
                                            <Clock size={14} className="text-muted" />
                                            {formatTime(record.firstCheckIn)}
                                        </div>
                                    </td>
                                    <td>
                                        <div className="time-cell">
                                            <Clock size={14} className="text-muted" />
                                            {formatTime(record.lastCheckOut)}
                                        </div>
                                    </td>
                                    <td>
                                        {record.minutesLate > 0 ? (
                                            <span className="lateness text-danger">+{record.minutesLate} mins</span>
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
                )}
            </div>
        </div>
    );
};

// Improvised missing icon import at top
import { RefreshCw } from 'lucide-react';
