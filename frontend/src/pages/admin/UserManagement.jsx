import { useState, useEffect } from 'react';
import api from '../../api/axios';
import { FiEdit2, FiTrash2, FiSearch } from 'react-icons/fi';

const UserManagement = () => {
    const [users, setUsers] = useState([]);
    const [search, setSearch] = useState('');
    const [roleFilter, setRoleFilter] = useState('');
    const [loading, setLoading] = useState(true);
    const [editUser, setEditUser] = useState(null);

    const fetchUsers = async () => {
        try {
            const params = {};
            if (search) params.search = search;
            if (roleFilter) params.role = roleFilter;
            const res = await api.get('/admin/users', { params });
            setUsers(res.data);
        } catch (err) { console.error(err); }
        setLoading(false);
    };

    useEffect(() => { fetchUsers(); }, [search, roleFilter]);

    const handleDelete = async (id) => {
        if (!confirm('Bu kullanıcıyı silmek istediğinize emin misiniz?')) return;
        try {
            await api.delete(`/admin/users/${id}`);
            setUsers(users.filter(u => u._id !== id));
        } catch (err) { console.error(err); }
    };

    const handleUpdate = async (e) => {
        e.preventDefault();
        try {
            const res = await api.put(`/admin/users/${editUser._id}`, editUser);
            setUsers(users.map(u => u._id === editUser._id ? res.data : u));
            setEditUser(null);
        } catch (err) { console.error(err); }
    };

    const getRoleBadge = (role) => {
        const map = { admin: 'badge-purple', trainer: 'badge-info', member: 'badge-success' };
        const labels = { admin: 'Admin', trainer: 'Antrenör', member: 'Üye' };
        return <span className={`badge ${map[role]}`}>{labels[role]}</span>;
    };

    if (loading) return <div className="loading-spinner"><div className="spinner"></div></div>;

    return (
        <div className="animate-fade-in">
            <div className="page-header">
                <div>
                    <h1>Kullanıcı Yönetimi</h1>
                    <p>{users.length} kullanıcı bulundu</p>
                </div>
            </div>

            <div className="action-bar">
                <div style={{ position: 'relative', flex: 1, minWidth: '200px' }}>
                    <FiSearch style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
                    <input type="text" className="search-input" placeholder="İsim veya e-posta ara..." value={search} onChange={(e) => setSearch(e.target.value)} />
                </div>
                <select className="form-control" style={{ width: 'auto', minWidth: '150px' }} value={roleFilter} onChange={(e) => setRoleFilter(e.target.value)}>
                    <option value="">Tüm Roller</option>
                    <option value="admin">Admin</option>
                    <option value="trainer">Antrenör</option>
                    <option value="member">Üye</option>
                </select>
            </div>

            <div className="glass-card" style={{ padding: 0, overflow: 'hidden' }}>
                <table className="data-table">
                    <thead>
                        <tr>
                            <th>İsim</th>
                            <th>E-posta</th>
                            <th>Telefon</th>
                            <th>Rol</th>
                            <th>Durum</th>
                            <th>İşlemler</th>
                        </tr>
                    </thead>
                    <tbody>
                        {users.map(user => (
                            <tr key={user._id}>
                                <td style={{ color: 'var(--text-primary)', fontWeight: 500 }}>{user.name}</td>
                                <td>{user.email}</td>
                                <td>{user.phone || '-'}</td>
                                <td>{getRoleBadge(user.role)}</td>
                                <td><span className={`badge ${user.isActive ? 'badge-success' : 'badge-danger'}`}>{user.isActive ? 'Aktif' : 'Pasif'}</span></td>
                                <td>
                                    <div style={{ display: 'flex', gap: '8px' }}>
                                        <button className="btn btn-secondary btn-sm" onClick={() => setEditUser({ ...user })}><FiEdit2 /></button>
                                        <button className="btn btn-danger btn-sm" onClick={() => handleDelete(user._id)}><FiTrash2 /></button>
                                    </div>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
                {users.length === 0 && <div className="empty-state"><p>Kullanıcı bulunamadı</p></div>}
            </div>

            {editUser && (
                <div className="modal-overlay" onClick={() => setEditUser(null)}>
                    <div className="modal-content" onClick={e => e.stopPropagation()}>
                        <div className="modal-header">
                            <h2>Kullanıcı Düzenle</h2>
                            <button className="modal-close" onClick={() => setEditUser(null)}>✕</button>
                        </div>
                        <form onSubmit={handleUpdate}>
                            <div className="form-group">
                                <label>İsim</label>
                                <input type="text" className="form-control" value={editUser.name} onChange={e => setEditUser({ ...editUser, name: e.target.value })} />
                            </div>
                            <div className="form-group">
                                <label>E-posta</label>
                                <input type="email" className="form-control" value={editUser.email} onChange={e => setEditUser({ ...editUser, email: e.target.value })} />
                            </div>
                            <div className="form-group">
                                <label>Telefon</label>
                                <input type="tel" className="form-control" value={editUser.phone || ''} onChange={e => setEditUser({ ...editUser, phone: e.target.value })} />
                            </div>
                            <div className="form-group">
                                <label>Rol</label>
                                <select className="form-control" value={editUser.role} onChange={e => setEditUser({ ...editUser, role: e.target.value })}>
                                    <option value="member">Üye</option>
                                    <option value="trainer">Antrenör</option>
                                    <option value="admin">Admin</option>
                                </select>
                            </div>
                            <div style={{ display: 'flex', gap: '12px', marginTop: '24px' }}>
                                <button type="submit" className="btn btn-primary" style={{ flex: 1, justifyContent: 'center' }}>Kaydet</button>
                                <button type="button" className="btn btn-secondary" onClick={() => setEditUser(null)}>İptal</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default UserManagement;
