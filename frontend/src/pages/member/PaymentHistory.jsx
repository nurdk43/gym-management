// ==========================================
// Ödeme Geçmişi Sayfası (Üye)
// Geçmiş ödemeleri tablo olarak listeler
// ==========================================

import { useState, useEffect } from 'react';
import api from '../../api/axios';

const PaymentHistory = () => {
    // ---- Durum Değişkenleri ----
    const [odemeler, setOdemeler] = useState([]);
    const [yukleniyor, setYukleniyor] = useState(true);

    // ---- Ödemeleri API'den Getir ----
    useEffect(() => {
        const odemeleriGetir = async () => {
            try {
                const yanit = await api.get('/member/payments');
                setOdemeler(yanit.data);
            } catch (hata) { console.error(hata); }
            setYukleniyor(false);
        };
        odemeleriGetir();
    }, []);

    // ---- Toplam Harcama Hesapla ----
    const toplamHarcama = odemeler.reduce((toplam, odeme) => toplam + (odeme.amount || 0), 0);

    if (yukleniyor) return <div className="yukleme-kaps"><div className="yukleme"></div></div>;

    return (
        <div className="anim-soluk">
            {/* ---- Sayfa Başlığı ---- */}
            <div className="sayfa-bas"><div><h1>Ödeme Geçmişi</h1><p>Tüm ödemelerinizi görüntüleyin</p></div></div>

            {/* ---- Özet Kartları ---- */}
            <div className="istat-izgara" style={{ marginBottom: '24px' }}>
                <div className="istat-kart anim-yukari">
                    <div className="istat-ikon sari">💰</div>
                    <div className="istat-bilgi"><h3>₺{toplamHarcama.toLocaleString()}</h3><p>Toplam Harcama</p></div>
                </div>
                <div className="istat-kart anim-yukari kademe-1">
                    <div className="istat-ikon mavi">📝</div>
                    <div className="istat-bilgi"><h3>{odemeler.length}</h3><p>Toplam İşlem</p></div>
                </div>
            </div>

            {/* ---- Ödeme Tablosu ---- */}
            <div className="kart" style={{ padding: 0, overflow: 'hidden' }}>
                <table className="tablo">
                    <thead><tr><th>Paket</th><th>Tutar</th><th>Ödeme Yöntemi</th><th>Tarih</th></tr></thead>
                    <tbody>
                        {odemeler.map(odeme => (
                            <tr key={odeme._id}>
                                <td style={{ color: '#f1f5f9', fontWeight: 500 }}>{odeme.enrollment?.package?.name || '-'}</td>
                                <td><span style={{ color: '#34d399', fontWeight: 600 }}>₺{odeme.amount?.toLocaleString()}</span></td>
                                <td><span className="rozet rozet-blg">{odeme.method === 'cash' ? 'Nakit' : odeme.method === 'card' ? 'Kredi Kartı' : 'Havale'}</span></td>
                                <td>{new Date(odeme.paidAt).toLocaleDateString('tr-TR', { day: 'numeric', month: 'long', year: 'numeric' })}</td>
                            </tr>
                        ))}
                    </tbody>
                </table>
                {odemeler.length === 0 && <div className="bos-durum"><div className="bos-ikon">💳</div><h3>Ödeme kaydı yok</h3><p>Henüz bir ödeme işlemi gerçekleştirmediniz</p></div>}
            </div>
        </div>
    );
};

export default PaymentHistory;
