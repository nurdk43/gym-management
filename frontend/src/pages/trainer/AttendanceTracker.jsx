import { useState, useEffect } from 'react';
import api from '../../api/axios';
import { FiUserPlus, FiLogOut } from 'react-icons/fi';

const AttendanceTracker = () => {
    const [members, setMembers] = useState([]);
    const [attendance, setAttendance] = useState([]);
    const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetch = async () => {
            try {
                const [membersRes, attendanceRes] = await Promise.all([
                    api.get('/trainer/members'),
                    api.get('/trainer/attendance', { params: { date: selectedDate } })
                ]);
                setMembers(membersRes.data);
                setAttendance(attendanceRes.data);
            } catch (err) { console.error(err); }
            setLoading(false);
        };
        fetch();
    }, [selectedDate]);

    const handleCheckIn = async (userId) => {
        try {
            const res = await api.post('/trainer/attendance', { userId });
            setAttendance([res.data, ...attendance]);
        } catch (err) { console.error(err); }
    };

    const handleCheckOut = async (id) => {
        try {
            const res = await api.put(`/trainer/attendance/${id}/checkout`);
            setAttendance(attendance.map(a => a._id === id ? res.data : a));
        } catch (err) { console.error(err); }
    };

    if (loading) return <div className="loading-spinner"><div className="spinner"></div></div>;

    return (
        <div className="animate-fade-in">
            <div className="page-header">
                <div><h1>Devam Takibi</h1><p>Üye giriş/çıkış kayıtlarını yönetin</p></div>
                <input type="date" className="form-control" style={{ width: 'auto' }} value={selectedDate} onChange={e => setSelectedDate(e.target.value)} />
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 2fr', gap: '24px' }}>
                <div className="glass-card">
                    <h3 className="section-title">👥 Üyeler</h3>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', maxHeight: '500px', overflowY: 'auto' }}>
                        {members.map(m => (
                            <div key={m._id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '10px 12px', background: 'var(--bg-glass)', borderRadius: '8px', border: '1px solid var(--border-glass)' }}>
                                <div>
                                    <div style={{ fontWeight: 500, fontSize: '14px' }}>{m.name}</div>
                                    <div style={{ fontSize: '12px', color: 'var(--text-muted)' }}>{m.email}</div>
                                </div>
                                <button className="btn btn-success btn-sm" onClick={() => handleCheckIn(m._id)}><FiUserPlus /></button>
                            </div>
                        ))}
                        {members.length === 0 && <p style={{ color: 'var(--text-muted)', fontSize: '14px' }}>Üye bulunamadı</p>}
                    </div>
                </div>

                <div className="glass-card" style={{ padding: 0, overflow: 'hidden' }}>
                    <div style={{ padding: '20px 24px', borderBottom: '1px solid var(--border-glass)' }}>
                        <h3 className="section-title" style={{ margin: 0 }}>📋 Bugünkü Kayıtlar ({attendance.length})</h3>
                    </div>
                    <table className="data-table">
                        <thead><tr><th>Üye</th><th>Giriş</th><th>Çıkış</th><th>İşlem</th></tr></thead>
                        <tbody>
                            {attendance.map(a => (
                                <tr key={a._id}>
                                    <td style={{ color: 'var(--text-primary)', fontWeight: 500 }}>{a.user?.name}</td>
                                    <td>{new Date(a.checkIn).toLocaleTimeString('tr-TR', { hour: '2-digit', minute: '2-digit' })}</td>
                                    <td>{a.checkOut ? new Date(a.checkOut).toLocaleTimeString('tr-TR', { hour: '2-digit', minute: '2-digit' }) : <span className="badge badge-warning">Devam ediyor</span>}</td>
                                    <td>{!a.checkOut && <button className="btn btn-danger btn-sm" onClick={() => handleCheckOut(a._id)}><FiLogOut /> Çıkış</button>}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                    {attendance.length === 0 && <div className="empty-state"><p>Bugün için kayıt yok</p></div>}
                </div>
            </div>
        </div>
    );
};

export default AttendanceTracker;
