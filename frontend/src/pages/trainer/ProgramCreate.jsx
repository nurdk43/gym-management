import { useState, useEffect } from 'react';
import api from '../../api/axios';
import { FiPlus, FiEdit2, FiTrash2, FiUsers } from 'react-icons/fi';

const ProgramCreate = () => {
    const [programs, setPrograms] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showModal, setShowModal] = useState(false);
    const [editProg, setEditProg] = useState(null);
    const [form, setForm] = useState({ title: '', description: '', dayOfWeek: 'Pazartesi', time: '', maxCapacity: '' });

    const days = ['Pazartesi', 'Salı', 'Çarşamba', 'Perşembe', 'Cuma', 'Cumartesi', 'Pazar'];

    useEffect(() => {
        const fetch = async () => {
            try { const res = await api.get('/trainer/programs'); setPrograms(res.data); } catch (err) { console.error(err); }
            setLoading(false);
        };
        fetch();
    }, []);

    const resetForm = () => setForm({ title: '', description: '', dayOfWeek: 'Pazartesi', time: '', maxCapacity: '' });

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            if (editProg) {
                const res = await api.put(`/trainer/programs/${editProg._id}`, form);
                setPrograms(programs.map(p => p._id === editProg._id ? res.data : p));
            } else {
                const res = await api.post('/trainer/programs', form);
                setPrograms([res.data, ...programs]);
            }
            setShowModal(false); setEditProg(null); resetForm();
        } catch (err) { console.error(err); }
    };

    const handleEdit = (prog) => {
        setEditProg(prog);
        setForm({ title: prog.title, description: prog.description || '', dayOfWeek: prog.dayOfWeek, time: prog.time, maxCapacity: prog.maxCapacity });
        setShowModal(true);
    };

    const handleDelete = async (id) => {
        if (!confirm('Bu programı silmek istediğinize emin misiniz?')) return;
        try { await api.delete(`/trainer/programs/${id}`); setPrograms(programs.filter(p => p._id !== id)); } catch (err) { console.error(err); }
    };

    if (loading) return <div className="loading-spinner"><div className="spinner"></div></div>;

    return (
        <div className="animate-fade-in">
            <div className="page-header">
                <div><h1>Programlar</h1><p>{programs.length} program oluşturulmuş</p></div>
                <button className="btn btn-primary" onClick={() => { resetForm(); setEditProg(null); setShowModal(true); }}><FiPlus /> Yeni Program</button>
            </div>

            <div className="package-grid">
                {programs.map((prog, i) => (
                    <div key={prog._id} className="package-card animate-slide-up" style={{ animationDelay: `${i * 0.1}s` }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start' }}>
                            <h3>{prog.title}</h3>
                            <span className={`badge ${prog.isActive ? 'badge-success' : 'badge-danger'}`}>{prog.isActive ? 'Aktif' : 'Pasif'}</span>
                        </div>
                        <p style={{ color: 'var(--text-secondary)', fontSize: '14px', marginTop: '8px' }}>{prog.description || 'Açıklama yok'}</p>
                        <ul className="features">
                            <li>📅 {prog.dayOfWeek}</li>
                            <li>🕐 {prog.time}</li>
                            <li><FiUsers style={{ marginRight: '4px' }} /> {prog.enrolledMembers?.length || 0} / {prog.maxCapacity} katılımcı</li>
                        </ul>
                        <div style={{ display: 'flex', gap: '8px' }}>
                            <button className="btn btn-secondary btn-sm" onClick={() => handleEdit(prog)}><FiEdit2 /> Düzenle</button>
                            <button className="btn btn-danger btn-sm" onClick={() => handleDelete(prog._id)}><FiTrash2 /> Sil</button>
                        </div>
                    </div>
                ))}
            </div>

            {programs.length === 0 && <div className="glass-card"><div className="empty-state"><div className="empty-icon">📋</div><h3>Henüz program yok</h3><p>İlk programınızı oluşturun</p></div></div>}

            {showModal && (
                <div className="modal-overlay" onClick={() => { setShowModal(false); setEditProg(null); }}>
                    <div className="modal-content" onClick={e => e.stopPropagation()}>
                        <div className="modal-header"><h2>{editProg ? 'Program Düzenle' : 'Yeni Program'}</h2><button className="modal-close" onClick={() => { setShowModal(false); setEditProg(null); }}>✕</button></div>
                        <form onSubmit={handleSubmit}>
                            <div className="form-group"><label>Program Adı</label><input type="text" name="title" className="form-control" value={form.title} onChange={e => setForm({ ...form, title: e.target.value })} required /></div>
                            <div className="form-group"><label>Açıklama</label><textarea name="description" className="form-control" rows="3" value={form.description} onChange={e => setForm({ ...form, description: e.target.value })} style={{ resize: 'vertical' }} /></div>
                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                                <div className="form-group"><label>Gün</label><select className="form-control" value={form.dayOfWeek} onChange={e => setForm({ ...form, dayOfWeek: e.target.value })}>{days.map(d => <option key={d} value={d}>{d}</option>)}</select></div>
                                <div className="form-group"><label>Saat</label><input type="time" className="form-control" value={form.time} onChange={e => setForm({ ...form, time: e.target.value })} required /></div>
                            </div>
                            <div className="form-group"><label>Maksimum Kapasite</label><input type="number" className="form-control" value={form.maxCapacity} onChange={e => setForm({ ...form, maxCapacity: e.target.value })} required min="1" /></div>
                            <div style={{ display: 'flex', gap: '12px', marginTop: '24px' }}>
                                <button type="submit" className="btn btn-primary" style={{ flex: 1, justifyContent: 'center' }}>{editProg ? 'Güncelle' : 'Oluştur'}</button>
                                <button type="button" className="btn btn-secondary" onClick={() => { setShowModal(false); setEditProg(null); }}>İptal</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default ProgramCreate;
