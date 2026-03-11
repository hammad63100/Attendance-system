import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { UserPlus, Search, User, Edit2, Trash2 } from 'lucide-react';
import './Students.css';

export const Students = () => {
    const { token } = useAuth();
    const [students, setStudents] = useState<any[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [showModal, setShowModal] = useState(false);

    // Form state
    const [editingStudent, setEditingStudent] = useState<any>(null);
    const [studentId, setStudentId] = useState('');
    const [firstName, setFirstName] = useState('');
    const [lastName, setLastName] = useState('');
    const [fatherName, setFatherName] = useState('');
    const [cnic, setCnic] = useState('');
    const [email, setEmail] = useState('');
    const [fingerData, setFingerData] = useState('');
    const [className, setClassName] = useState('');
    const [section, setSection] = useState('');
    const [isScanning, setIsScanning] = useState(false);

    const fetchStudents = async () => {
        setIsLoading(true);
        try {
            const res = await fetch('http://localhost:3000/students', {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            if (res.ok) {
                const data = await res.json();
                setStudents(data);
            }
        } catch (error) {
            console.error('Error fetching students:', error);
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        fetchStudents();
    }, [token]);

    const handleScanFingerprint = async () => {
        setIsScanning(true);
        try {
            const res = await fetch('http://localhost:3000/devices/scan-fingerprint', {
                method: 'POST',
                headers: { 'Authorization': `Bearer ${token}` }
            });
            const data = await res.json();

            if (res.ok && data.fingerData) {
                setFingerData(data.fingerData);
                alert(`✅ ${data.message}`);
            } else if (res.ok && data.status === 'warning') {
                alert(`⚠️ ${data.message}`);
            } else {
                alert(`❌ ${data.message || 'Failed to scan fingerprint. Make sure a device is ONLINE and has enrolled fingerprints.'}`);
            }
        } catch (error) {
            console.error('Error scanning fingerprint:', error);
            alert('❌ Cannot reach the backend server. Make sure it is running.');
        } finally {
            setIsScanning(false);
        }
    };

    const handleAddOrEditStudent = async (e: React.FormEvent) => {
        e.preventDefault();

        // Validate CNIC (must be 13 digits without dashes)
        if (!/^\d{13}$/.test(cnic)) {
            alert('❌ CNIC must be exactly 13 digits without any dashes.');
            return;
        }

        // Validate Fingerprint
        if (!fingerData) {
            alert('❌ Fingerprint data is required. Please scan a fingerprint before saving.');
            return;
        }

        try {
            const isEditing = !!editingStudent;
            const url = isEditing ? `http://localhost:3000/students/${editingStudent.id}` : 'http://localhost:3000/students';
            const method = isEditing ? 'PUT' : 'POST';

            const res = await fetch(url, {
                method,
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({ studentId, firstName, lastName, fatherName, cnic, email, fingerData, className, section })
            });

            if (res.ok) {
                closeModal();
                fetchStudents();
            } else {
                alert(`Error ${isEditing ? 'updating' : 'adding'} student. Student ID or CNIC might already exist.`);
            }
        } catch (error) {
            console.error('Error:', error);
        }
    };

    const handleEditStudent = (student: any) => {
        setEditingStudent(student);
        setStudentId(student.studentId);
        setFirstName(student.firstName);
        setLastName(student.lastName || '');
        setFatherName(student.fatherName || '');
        setCnic(student.cnic || '');
        setEmail(student.email || '');
        setFingerData(student.fingerData || '');
        setClassName(student.className || '');
        setSection(student.section || '');
        setShowModal(true);
    };

    const handleDeleteStudent = async (id: string, name: string) => {
        if (!window.confirm(`Are you sure you want to delete ${name}?`)) return;

        try {
            const res = await fetch(`http://localhost:3000/students/${id}`, {
                method: 'DELETE',
                headers: { 'Authorization': `Bearer ${token}` }
            });

            if (res.ok) {
                fetchStudents();
            } else {
                alert('Failed to delete student.');
            }
        } catch (error) {
            console.error('Error deleting student:', error);
            alert('Error deleting student.');
        }
    };

    const closeModal = () => {
        setShowModal(false);
        setEditingStudent(null);
        setStudentId('');
        setFirstName('');
        setLastName('');
        setFatherName('');
        setCnic('');
        setEmail('');
        setFingerData('');
        setClassName('');
        setSection('');
    };

    return (
        <div className="students-container">
            <div className="students-header">
                <div>
                    <h1 className="text-2xl font-bold text-main mb-2">Student Directory</h1>
                    <p className="text-muted">Manage enrolled students and their details.</p>
                </div>
                <button
                    onClick={() => setShowModal(true)}
                    className="add-student-btn"
                >
                    <UserPlus size={20} />
                    Add Student
                </button>
            </div>

            <div className="glass-panel students-list-panel">
                <div className="search-bar-container">
                    <div className="search-input-wrapper">
                        <Search className="search-icon" size={18} />
                        <input
                            type="text"
                            placeholder="Search students..."
                            className="search-input"
                        />
                    </div>
                </div>

                <div className="students-list-wrapper">
                    {isLoading ? (
                        <div className="flex-center h-full text-muted">Loading students...</div>
                    ) : students.length === 0 ? (
                        <div className="flex-center h-full flex-col gap-4 text-muted pt-10 pb-10">
                            <User size={64} className="opacity-20 text-muted" />
                            <p className="text-lg">No students found. Add your first student.</p>
                        </div>
                    ) : (
                        <div className="students-grid">
                            {students.map(student => (
                                <div key={student.id} className="student-card">
                                    <div className="student-avatar">
                                        {student.firstName[0]}{student.lastName?.[0] || ''}
                                    </div>
                                    <div className="student-info">
                                        <h3>{student.firstName} {student.lastName}</h3>
                                        <p>ID: {student.studentId}</p>
                                        <div className="student-details-meta">
                                            Class: {student.className || 'N/A'} {student.section ? `| Sec: ${student.section}` : ''}
                                        </div>
                                    </div>
                                    <div className="student-actions">
                                        <button className="action-btn" title="Edit Student" onClick={() => handleEditStudent(student)}>
                                            <Edit2 size={16} />
                                        </button>
                                        <button className="action-btn delete" title="Remove Student" onClick={() => handleDeleteStudent(student.id, student.firstName)}>
                                            <Trash2 size={16} />
                                        </button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>

            {/* Modal for adding/editing student */}
            {showModal && (
                <div className="modal-overlay">
                    <div className="add-student-modal glass-panel animate-fade-in" style={{ maxHeight: '90vh', overflowY: 'auto' }}>
                        <button
                            onClick={closeModal}
                            className="close-modal-btn"
                        >✕</button>
                        <h2 className="text-2xl font-bold mb-2">{editingStudent ? 'Edit Student' : 'Add New Student'}</h2>
                        <form onSubmit={handleAddOrEditStudent} className="modal-form">
                            <div className="form-row">
                                <div className="form-group">
                                    <label>System/Roll ID *</label>
                                    <input
                                        required
                                        type="text"
                                        value={studentId}
                                        onChange={e => setStudentId(e.target.value)}
                                        className="form-input"
                                    />
                                </div>
                                <div className="form-group">
                                    <label>CNIC Number (No Dashes) *</label>
                                    <input
                                        required
                                        type="text"
                                        placeholder="1234567890123"
                                        maxLength={13}
                                        pattern="\d{13}"
                                        title="Please enter exactly 13 digits without dashes"
                                        value={cnic}
                                        onChange={e => setCnic(e.target.value.replace(/\D/g, ''))}
                                        className="form-input"
                                    />
                                </div>
                            </div>
                            <div className="form-row">
                                <div className="form-group">
                                    <label>Class *</label>
                                    <input
                                        required
                                        type="text"
                                        value={className}
                                        onChange={e => setClassName(e.target.value)}
                                        className="form-input"
                                        placeholder="e.g. 10th"
                                    />
                                </div>
                                <div className="form-group">
                                    <label>Section</label>
                                    <input
                                        type="text"
                                        value={section}
                                        onChange={e => setSection(e.target.value)}
                                        className="form-input"
                                        placeholder="e.g. A"
                                    />
                                </div>
                            </div>
                            <div className="form-row">
                                <div className="form-group">
                                    <label>First Name *</label>
                                    <input
                                        required
                                        type="text"
                                        value={firstName}
                                        onChange={e => setFirstName(e.target.value)}
                                        className="form-input"
                                    />
                                </div>
                                <div className="form-group">
                                    <label>Last Name</label>
                                    <input
                                        type="text"
                                        value={lastName}
                                        onChange={e => setLastName(e.target.value)}
                                        className="form-input"
                                    />
                                </div>
                            </div>
                            <div className="form-row">
                                <div className="form-group">
                                    <label>Father Name</label>
                                    <input
                                        type="text"
                                        value={fatherName}
                                        onChange={e => setFatherName(e.target.value)}
                                        className="form-input"
                                    />
                                </div>
                                <div className="form-group">
                                    <label>Email (Optional)</label>
                                    <input
                                        type="email"
                                        value={email}
                                        onChange={e => setEmail(e.target.value)}
                                        className="form-input"
                                    />
                                </div>
                            </div>
                            <div className="form-group">
                                <label>Fingerprint Scan *</label>
                                <div className="flex gap-2">
                                    <button
                                        type="button"
                                        onClick={handleScanFingerprint}
                                        disabled={isScanning || !!fingerData}
                                        className="btn btn-secondary flex-1 justify-center py-2"
                                        style={{ background: fingerData ? 'var(--success)' : '', color: fingerData ? 'white' : '' }}
                                    >
                                        {isScanning ? 'Scanning...' : fingerData ? 'Captured ✔' : 'Scan via Device'}
                                    </button>
                                </div>
                                {fingerData && <p className="text-xs text-success mt-1">Fingerprint template ready.</p>}
                            </div>
                            <button type="submit" className="submit-btn mt-2">
                                {editingStudent ? 'Update Student' : 'Save Student'}
                            </button>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};
