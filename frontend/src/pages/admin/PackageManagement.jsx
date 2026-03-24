import { useState, useEffect } from 'react';
import api from '../../api/axios';
import { FiPlus, FiEdit2, FiTrash2 } from 'react-icons/fi';

const PackageManagement = () => {
    const [packages, setPackages] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showModal, setShowModal] = useState(false);
    const [editPkg, setEditPkg] = useState(null);
    const [form, setForm] = useState({ name: '', description: '', price: '', durationDays: '', maxClasses: '', isActive: true });

    const fetchPackages = async () => {
        try {
            const res = await api.get('/admin/packages');
            setPackages(res.data);
        } catch (err) { console.error(err); }
        setLoading(false);
    };

    useEffect(() => { fetchPackages(); }, []);

    const resetForm = () => setForm({ name: '', description: '', price: '', durationDays: '', maxClasses: '', isActive: true });

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            if (editPkg) {
                const res = await api.put(`/admin/packages/${editPkg._id}`, form);
                setPackages(packages.map(p => p._id === editPkg._id ? res.data : p));
            } else {
                const res = await api.post('/admin/packages', form);
                setPackages([res.data, ...packages]);
            }
            setShowModal(false);
            setEditPkg(null);
            resetForm();
        } catch (err) { console.error(err); }
    };

    const handleEdit = (pkg) => {
        setEditPkg(pkg);
        setForm({ name: pkg.name, description: pkg.description || '', price: pkg.price, durationDays: pkg.durationDays, maxClasses: pkg.maxClasses || '', isActive: pkg.isActive });
        setShowModal(true);
    };

    const handleDelete = async (id) => {
        if (!confirm('Bu paketi silmek istediğinize emin misiniz?')) return;
        try {
            await api.delete(`/admin/packages/${id}`);
            setPackages(packages.filter(p => p._id !== id));
        } catch (err) { console.error(err); }
    };

    const handleChange = (e) => {
        const val = e.target.type === 'checkbox' ? e.target.checked : e.target.value;
        setForm({ ...form, [e.target.name]: val });
    };

    if (loading) return <div className="loading-spinner"><div className="spinner"></div></div>;

    return (
        <div className="animate-fade-in">
            <div className="page-header">
                <div>
                    <h1>Paket Yönetimi</h1>
                    <p>Üyelik paketlerini yönetin</p>
                </div>
                <button className="btn btn-primary" onClick={() => { resetForm(); setEditPkg(null); setShowModal(true); }}>
                    <FiPlus /> Yeni Paket
                </button>
            </div>

            <div className="package-grid">
                {packages.map((pkg, i) => (
                    <div key={pkg._id} className="package-card animate-slide-up" style={{ animationDelay: `${i * 0.1}s` }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start' }}>
                            <h3>{pkg.name}</h3>
                            <span className={`badge ${pkg.isActive ? 'badge-success' : 'badge-danger'}`}>{pkg.isActive ? 'Aktif' : 'Pasif'}</span>
                        </div>
                        <p style={{ color: 'var(--text-secondary)', fontSize: '14px', marginTop: '8px' }}>{pkg.description || 'Açıklama yok'}</p>
                        <div className="price">₺{pkg.price?.toLocaleString()} <span>/ {pkg.durationDays} gün</span></div>
                        <ul className="features">
                            <li>{pkg.durationDays} gün süre</li>
                            {pkg.maxClasses > 0 && <li>{pkg.maxClasses} ders hakkı</li>}
                            <li>Tüm ekipmanlara erişim</li>
                        </ul>
                        <div style={{ display: 'flex', gap: '8px' }}>
                            <button className="btn btn-secondary btn-sm" onClick={() => handleEdit(pkg)}><FiEdit2 /> Düzenle</button>
                            <button className="btn btn-danger btn-sm" onClick={() => handleDelete(pkg._id)}><FiTrash2 /> Sil</button>
                        </div>
                    </div>
                ))}
            </div>

            {packages.length === 0 && <div className="glass-card"><div className="empty-state"><div className="empty-icon">📦</div><h3>Henüz paket yok</h3><p>İlk üyelik paketinizi oluşturun</p></div></div>}

            {showModal && (
                <div className="modal-overlay" onClick={() => { setShowModal(false); setEditPkg(null); }}>
                    <div className="modal-content" onClick={e => e.stopPropagation()}>
                        <div className="modal-header">
                            <h2>{editPkg ? 'Paket Düzenle' : 'Yeni Paket'}</h2>
                            <button className="modal-close" onClick={() => { setShowModal(false); setEditPkg(null); }}>✕</button>
                        </div>
                        <form onSubmit={handleSubmit}>
                            <div className="form-group">
                                <label>Paket Adı</label>
                                <input type="text" name="name" className="form-control" value={form.name} onChange={handleChange} required />
                            </div>
                            <div className="form-group">
                                <label>Açıklama</label>
                                <textarea name="description" className="form-control" rows="3" value={form.description} onChange={handleChange} style={{ resize: 'vertical' }} />
                            </div>
                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                                <div className="form-group">
                                    <label>Fiyat (₺)</label>
                                    <input type="number" name="price" className="form-control" value={form.price} onChange={handleChange} required min="0" />
                                </div>
                                <div className="form-group">
                                    <label>Süre (Gün)</label>
                                    <input type="number" name="durationDays" className="form-control" value={form.durationDays} onChange={handleChange} required min="1" />
                                </div>
                            </div>
                            <div className="form-group">
                                <label>Maks. Ders Sayısı (0 = sınırsız)</label>
                                <input type="number" name="maxClasses" className="form-control" value={form.maxClasses} onChange={handleChange} min="0" />
                            </div>
                            <div style={{ display: 'flex', gap: '12px', marginTop: '24px' }}>
                                <button type="submit" className="btn btn-primary" style={{ flex: 1, justifyContent: 'center' }}>{editPkg ? 'Güncelle' : 'Oluştur'}</button>
                                <button type="button" className="btn btn-secondary" onClick={() => { setShowModal(false); setEditPkg(null); }}>İptal</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default PackageManagement;
