import { useState, useEffect } from 'react';
import api from '../../api/axios';
import { FiPlus, FiX } from 'react-icons/fi';

const MyClasses = () => {
    const [allClasses, setAllClasses] = useState([]);
    const [myClasses, setMyClasses] = useState([]);
    const [tab, setTab] = useState('my');
    const [loading, setLoading] = useState(true);

    const fetchData = async () => {
        try {
            const [allRes, myRes] = await Promise.all([
                api.get('/member/classes'),
                api.get('/member/my-classes')
            ]);
            setAllClasses(allRes.data);
            setMyClasses(myRes.data);
        } catch (err) { console.error(err); }
        setLoading(false);
    };

    useEffect(() => { fetchData(); }, []);

    const handleEnroll = async (programId) => {
        try {
            await api.post('/member/classes/enroll', { programId });
            alert('Derse başarıyla kaydoldunuz! 🎉');
            fetchData();
        } catch (err) { alert(err.response?.data?.message || 'Bir hata oluştu'); }
    };

    const handleCancel = async (programId) => {
        if (!confirm('Dersten çıkmak istediğinize emin misiniz?')) return;
        try {
            await api.delete(`/member/classes/${programId}`);
            fetchData();
        } catch (err) { console.error(err); }
    };

    if (loading) return <div className="loading-spinner"><div className="spinner"></div></div>;

    return (
        <div className="animate-fade-in">
            <div className="page-header"><div><h1>Derslerim</h1><p>Ders kayıt ve iptal işlemleri</p></div></div>

            <div className="action-bar">
                <button className={`btn ${tab === 'my' ? 'btn-primary' : 'btn-secondary'}`} onClick={() => setTab('my')}>Kayıtlı Derslerim ({myClasses.length})</button>
                <button className={`btn ${tab === 'all' ? 'btn-primary' : 'btn-secondary'}`} onClick={() => setTab('all')}>Tüm Dersler ({allClasses.length})</button>
            </div>

            {tab === 'my' && (
                <div className="package-grid">
                    {myClasses.map((cls, i) => (
                        <div key={cls._id} className="glass-card animate-slide-up" style={{ animationDelay: `${i * 0.1}s` }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start' }}>
                                <h3 style={{ fontSize: '18px', fontWeight: 600 }}>{cls.title}</h3>
                                <span className="badge badge-success">Kayıtlı</span>
                            </div>
                            <p style={{ color: 'var(--text-secondary)', fontSize: '13px', marginTop: '8px' }}>{cls.description || ''}</p>
                            <div style={{ marginTop: '16px', display: 'flex', flexDirection: 'column', gap: '6px', fontSize: '14px', color: 'var(--text-secondary)' }}>
                                <span>📅 {cls.dayOfWeek} - 🕐 {cls.time}</span>
                                <span>👤 Antrenör: {cls.trainer?.name}</span>
                            </div>
                            <button className="btn btn-danger" style={{ width: '100%', justifyContent: 'center', marginTop: '16px' }} onClick={() => handleCancel(cls._id)}><FiX /> Dersten Çık</button>
                        </div>
                    ))}
                    {myClasses.length === 0 && <div className="glass-card" style={{ gridColumn: '1/-1' }}><div className="empty-state"><div className="empty-icon">📚</div><h3>Kayıtlı ders yok</h3><p>Tüm dersler sekmesinden derse kaydolun</p></div></div>}
                </div>
            )}

            {tab === 'all' && (
                <div className="package-grid">
                    {allClasses.map((cls, i) => {
                        const isEnrolled = myClasses.some(m => m._id === cls._id);
                        const isFull = cls.enrolledMembers?.length >= cls.maxCapacity;
                        return (
                            <div key={cls._id} className="glass-card animate-slide-up" style={{ animationDelay: `${i * 0.1}s` }}>
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start' }}>
                                    <h3 style={{ fontSize: '18px', fontWeight: 600 }}>{cls.title}</h3>
                                    {isFull ? <span className="badge badge-danger">Dolu</span> : <span className="badge badge-info">{cls.enrolledMembers?.length}/{cls.maxCapacity}</span>}
                                </div>
                                <p style={{ color: 'var(--text-secondary)', fontSize: '13px', marginTop: '8px' }}>{cls.description || ''}</p>
                                <div style={{ marginTop: '16px', display: 'flex', flexDirection: 'column', gap: '6px', fontSize: '14px', color: 'var(--text-secondary)' }}>
                                    <span>📅 {cls.dayOfWeek} - 🕐 {cls.time}</span>
                                    <span>👤 Antrenör: {cls.trainer?.name}</span>
                                </div>
                                {isEnrolled ? (
                                    <button className="btn btn-secondary" style={{ width: '100%', justifyContent: 'center', marginTop: '16px' }} disabled>✓ Zaten Kayıtlısınız</button>
                                ) : (
                                    <button className="btn btn-primary" style={{ width: '100%', justifyContent: 'center', marginTop: '16px' }} onClick={() => handleEnroll(cls._id)} disabled={isFull}><FiPlus /> {isFull ? 'Kapasite Dolu' : 'Kaydol'}</button>
                                )}
                            </div>
                        );
                    })}
                    {allClasses.length === 0 && <div className="glass-card" style={{ gridColumn: '1/-1' }}><div className="empty-state"><div className="empty-icon">📚</div><h3>Henüz ders yok</h3><p>Antrenörler tarafından ders oluşturulduğunda burada görünecek</p></div></div>}
                </div>
            )}
        </div>
    );
};

export default MyClasses;
