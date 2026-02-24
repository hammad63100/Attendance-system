import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { Server, Activity, Plus, Trash2, Edit2, PlayCircle, RefreshCw } from 'lucide-react';
import './Devices.css';

interface Device {
    id: string;
    name: string;
    ip: string;
    port: number;
    status: string;
    lastSyncTime: string | null;
}

export const Devices = () => {
    const { token } = useAuth();
    const [devices, setDevices] = useState<Device[]>([]);
    const [loading, setLoading] = useState(true);
    const [testingId, setTestingId] = useState<string | null>(null);
    const [showModal, setShowModal] = useState(false);
    const [newDevice, setNewDevice] = useState({ name: '', ip: '', port: 4370 });
    const [isScanning, setIsScanning] = useState(false);
    const [editingDevice, setEditingDevice] = useState<Device | null>(null);

    const scanNetworkForDevices = () => {
        setIsScanning(true);
        // Simulate scanning network
        setTimeout(() => {
            const simulatedFoundIp = `192.168.1.${Math.floor(Math.random() * 200) + 10}`;
            setNewDevice(prev => ({ ...prev, name: 'ZKTeco Office Main', ip: simulatedFoundIp }));
            setIsScanning(false);
            alert(`Found potential device at ${simulatedFoundIp}`);
        }, 3000);
    };

    const handleAddOrEditDevice = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            const isEditing = !!editingDevice;
            const url = isEditing ? `http://localhost:3000/devices/${editingDevice.id}` : 'http://localhost:3000/devices';
            const method = isEditing ? 'PATCH' : 'POST';

            const response = await fetch(url, {
                method,
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${token}`
                },
                body: JSON.stringify(newDevice)
            });

            if (response.ok) {
                closeModal();
                fetchDevices();
            } else {
                alert(`Failed to ${isEditing ? 'edit' : 'add'} device.`);
            }
        } catch (err) {
            console.error('Error saving device', err);
            alert('Error saving device');
        }
    };

    const handleDeleteDevice = async (id: string, name: string) => {
        if (!window.confirm(`Are you sure you want to delete ${name}?`)) return;
        try {
            const response = await fetch(`http://localhost:3000/devices/${id}`, {
                method: 'DELETE',
                headers: { Authorization: `Bearer ${token}` }
            });
            if (response.ok) fetchDevices();
            else alert('Failed to delete device.');
        } catch (error) {
            console.error('Error deleting device', error);
        }
    };

    const openEditModal = (device: Device) => {
        setEditingDevice(device);
        setNewDevice({ name: device.name, ip: device.ip, port: device.port });
        setShowModal(true);
    };

    const closeModal = () => {
        setShowModal(false);
        setEditingDevice(null);
        setNewDevice({ name: '', ip: '', port: 4370 });
    };

    const fetchDevices = async () => {
        try {
            const response = await fetch('http://localhost:3000/devices', {
                headers: { Authorization: `Bearer ${token}` }
            });
            const data = await response.json();
            setDevices(data);
        } catch (err) {
            console.error("Failed to fetch devices", err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchDevices();
    }, []);

    const testConnection = async (id: string, name: string) => {
        setTestingId(id);
        try {
            const response = await fetch(`http://localhost:3000/devices/${id}/test-connection`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            const result = await response.json();
            alert(result.message);
        } catch (err) {
            alert(`Failed to test connection for ${name}`);
        } finally {
            setTestingId(null);
            fetchDevices();
        }
    };

    if (loading) {
        return (
            <div className="flex-center h-full">
                <Server className="animate-pulse text-primary" size={48} />
            </div>
        );
    }

    return (
        <div className="devices-container">
            <div className="page-header">
                <div>
                    <h1>Device Management</h1>
                    <p className="text-muted">Manage and monitor biometric attendance devices.</p>
                </div>
                <div className="header-actions">
                    <button className="btn btn-secondary" onClick={fetchDevices}>
                        <RefreshCw size={18} /> Refresh
                    </button>
                    <button className="btn btn-primary" onClick={() => setShowModal(true)}>
                        <Plus size={18} /> Add Device
                    </button>
                </div>
            </div>

            <div className="devices-grid">
                {devices.map((device, index) => (
                    <div
                        key={device.id}
                        className="device-card glass-panel"
                        style={{ animationDelay: `${index * 0.1}s` }}
                    >
                        <div className="device-header">
                            <div className="device-icon-wrapper">
                                <Server size={24} className={device.status === 'ONLINE' ? 'text-success' : 'text-danger'} />
                            </div>
                            <div className={`status-badge ${device.status.toLowerCase()}`}>
                                <span className="status-dot"></span>
                                {device.status}
                            </div>
                        </div>

                        <div className="device-info">
                            <h3>{device.name}</h3>
                            <p className="device-ip">{device.ip}:{device.port}</p>
                            <p className="device-sync text-muted">
                                Last Sync: {device.lastSyncTime ? new Date(device.lastSyncTime).toLocaleString() : 'Never'}
                            </p>
                        </div>

                        <div className="device-actions">
                            <button
                                className="action-btn test"
                                title="Test Connection"
                                onClick={() => testConnection(device.id, device.name)}
                                disabled={testingId === device.id}
                            >
                                {testingId === device.id ? <RefreshCw size={16} className="animate-spin" /> : <PlayCircle size={16} />}
                            </button>
                            <button className="action-btn edit" title="Edit Device" onClick={() => openEditModal(device)}>
                                <Edit2 size={16} />
                            </button>
                            <button className="action-btn delete" title="Remove Device" onClick={() => handleDeleteDevice(device.id, device.name)}>
                                <Trash2 size={16} />
                            </button>
                        </div>
                    </div>
                ))}

                {devices.length === 0 && (
                    <div className="empty-state glass-panel">
                        <Activity size={48} className="text-muted mb-4" />
                        <h3>No Devices Found</h3>
                        <p className="text-muted">You haven't added any biometric devices yet.</p>
                    </div>
                )}
            </div>

            {/* Modal for adding/editing device */}
            {showModal && (
                <div className="modal-overlay">
                    <div className="add-student-modal glass-panel animate-fade-in" style={{ maxHeight: '90vh', overflowY: 'auto' }}>
                        <button
                            onClick={closeModal}
                            className="close-modal-btn"
                        >✕</button>
                        <h2 className="text-2xl font-bold mb-2">{editingDevice ? 'Edit Device' : 'Add New Device'}</h2>
                        <div className="flex justify-between items-center mb-4 mt-2">
                            <p className="text-sm text-muted">Manually {editingDevice ? 'edit' : 'add'} or scan the local network for active biometric devices.</p>
                            {!editingDevice && (
                                <button
                                    type="button"
                                    onClick={scanNetworkForDevices}
                                    disabled={isScanning}
                                    className="btn btn-secondary text-sm px-3 py-1.5"
                                >
                                    {isScanning ? <RefreshCw size={14} className="animate-spin" /> : <Activity size={14} />}
                                    {isScanning ? 'Scanning...' : 'Scan Network'}
                                </button>
                            )}
                        </div>
                        <form onSubmit={handleAddOrEditDevice} className="modal-form">
                            <div className="form-group">
                                <label>Device Name *</label>
                                <input
                                    required
                                    type="text"
                                    placeholder="e.g. Main Gate Scanner"
                                    value={newDevice.name}
                                    onChange={e => setNewDevice({ ...newDevice, name: e.target.value })}
                                    className="form-input"
                                />
                            </div>
                            <div className="form-row">
                                <div className="form-group">
                                    <label>IP Address *</label>
                                    <input
                                        required
                                        type="text"
                                        placeholder="192.168.1.100"
                                        value={newDevice.ip}
                                        onChange={e => setNewDevice({ ...newDevice, ip: e.target.value })}
                                        className="form-input"
                                        style={{ fontFamily: 'monospace' }}
                                    />
                                </div>
                                <div className="form-group">
                                    <label>Port *</label>
                                    <input
                                        required
                                        type="number"
                                        placeholder="4370"
                                        value={newDevice.port}
                                        onChange={e => setNewDevice({ ...newDevice, port: parseInt(e.target.value) || 4370 })}
                                        className="form-input"
                                    />
                                </div>
                            </div>
                            <button type="submit" className="submit-btn mt-4">
                                {editingDevice ? 'Update Device' : 'Save Device'}
                            </button>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};
