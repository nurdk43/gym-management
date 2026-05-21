// ==========================================
// Ödeme Sayfası (Üye)
// Kart bilgilerini alır ve ödemeyi simüle eder
// ==========================================

import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../../api/axios';
import { FiCreditCard, FiLock, FiCheckCircle } from 'react-icons/fi';
import toast from 'react-hot-toast';

const PaymentPage = () => {
    const { packageId } = useParams();
    const navigate = useNavigate();
    const [paket, setPaket] = useState(null);
    const [yukleniyor, setYukleniyor] = useState(true);
    const [odemeYapiliyor, setOdemeYapiliyor] = useState(false);
    const [basarili, setBasarili] = useState(false);

    // ---- Form Durumu ----
    const [kart, setKart] = useState({
        numara: '',
        ad: '',
        tarih: '',
        cvv: ''
    });

    // ---- Hata Durumu ----
    const [hatalar, setHatalar] = useState({});

    // ---- Form Alanı Değiştirme ----
    const alanDegistir = (e) => {
        const { name, value } = e.target;
        setKart({ ...kart, [name]: value });
    };

    useEffect(() => {
        const paketGetir = async () => {
            try {
                const yanit = await api.get('/member/packages');
                const secilen = yanit.data.find(p => p._id === packageId);
                if (secilen) setPaket(secilen);
                else navigate('/member/packages');
            } catch (hata) {
                console.error('Paket getirme hatası:', hata);
                navigate('/member/packages');
            }
            setYukleniyor(false);
        };
        paketGetir();
    }, [packageId, navigate]);

    // ---- Kart No Formatla ----
    const kartNoFormat = (deger) => {
        const v = deger.replace(/\s+/g, '').replace(/[^0-9]/gi, '');
        const matches = v.match(/\d{4,16}/g);
        const match = (matches && matches[0]) || '';
        const parts = [];
        for (let i = 0, len = match.length; i < len; i += 4) {
            parts.push(match.substring(i, i + 4));
        }
        if (parts.length > 0) return parts.join(' ');
        return v;
    };

    const handleOdeme = async (e) => {
        e.preventDefault();
        const yeniHatalar = {};

        // ---- Validasyon Kontrolleri ----
        const temizNo = kart.numara.replace(/\s+/g, '');
        if (temizNo.length !== 16) {
            yeniHatalar.numara = 'Kart numarası tam olarak 16 hane olmalıdır';
        }

        const adParcalari = kart.ad.trim().split(' ');
        if (adParcalari.length < 2 || adParcalari[0].length < 2 || adParcalari[adParcalari.length - 1].length < 2) {
            yeniHatalar.ad = 'Lütfen kart üzerindeki ad ve soyadı eksiksiz giriniz';
        }

        const [ay, yil] = kart.tarih.split('/');
        if (!ay || !yil || yil.length !== 2) {
            yeniHatalar.tarih = 'Geçerli bir tarih giriniz (AA/YY)';
        } else {
            const yilSayi = parseInt(yil);
            if (yilSayi < 26) {
                yeniHatalar.tarih = 'Son kullanma yılı en az 2026 olmalıdır';
            }
        }

        if (kart.cvv.length < 3) {
            yeniHatalar.cvv = 'CVV 3 hane olmalıdır';
        }

        if (Object.keys(yeniHatalar).length > 0) {
            setHatalar(yeniHatalar);
            toast.error('Lütfen formdaki hataları düzeltiniz');
            return;
        }

        setHatalar({});
        setOdemeYapiliyor(true);

        try {
            // Ödemeyi simüle etmek için bekletiyoruz
            await new Promise(resolve => setTimeout(resolve, 2000));

            await api.post('/member/enroll', { packageId, method: 'card' });
            setBasarili(true);
            toast.success('Ödeme başarıyla tamamlandı!');

            setTimeout(() => {
                navigate('/member/payments');
            }, 3000);
        } catch (hata) {
            toast.error(hata.response?.data?.message || 'Ödeme başarısız oldu');
            setOdemeYapiliyor(false);
        }
    };

    if (yukleniyor) return <div className="yukleme-kaps"><div className="yukleme"></div></div>;

    if (basarili) {
        return (
            <div className="anim-soluk" style={{ textAlign: 'center', padding: '60px 20px' }}>
                <div className="kart" style={{ maxWidth: '500px', margin: '0 auto', padding: '48px' }}>
                    <FiCheckCircle style={{ fontSize: '80px', color: '#34d399', marginBottom: '24px' }} />
                    <h2 style={{ fontSize: '28px', marginBottom: '16px' }}>Ödeme Başarılı!</h2>
                    <p style={{ color: '#94a3b8', marginBottom: '32px' }}>
                        Paketiniz başarıyla tanımlandı. Yönlendiriliyorsunuz...
                    </p>
                    <div className="yukleme-spinner"><div className="yuk"></div></div>
                </div>
            </div>
        );
    }

    return (
        <div className="an-sol">
            <div className="sayfa-bas">
                <div><h1>Ödeme İşlemi</h1><p>Güvenli ödeme altyapısı ile işleminizi tamamlayın</p></div>
            </div>

            <div className="istat-izgara" style={{ gridTemplateColumns: '1fr 400px' }}>
                {/* ---- Kredi Kartı Görseli ve Form ---- */}
                <div className="kart">
                    <h3 style={{ fontSize: '20px', marginBottom: '24px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <FiCreditCard /> Kart Bilgileri
                    </h3>
                    <form onSubmit={handleOdeme}>
                        <div className="form-grup">
                            <label>Kart Sahibi</label>
                            <input type="text" className={`form-kontrol ${hatalar.ad ? 'hata' : ''}`} placeholder="Ad Soyad" required
                                value={kart.ad} onChange={e => setKart({ ...kart, ad: e.target.value.toUpperCase() })} />
                            {hatalar.ad && <span className="hata-mesaji">{hatalar.ad}</span>}
                        </div>
                        <div className="form-grup">
                            <label>Kart Numarası</label>
                            <input type="text" className={`form-kontrol ${hatalar.numara ? 'hata' : ''}`} placeholder="0000 0000 0000 0000" maxLength="19" required
                                value={kart.numara} onChange={e => setKart({ ...kart, numara: kartNoFormat(e.target.value) })} />
                            {hatalar.numara && <span className="hata-mesaji">{hatalar.numara}</span>}
                        </div>
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                            <div className="form-grup">
                                <label>Son Kullanma Tarihi</label>
                                <input type="text" className={`form-kontrol ${hatalar.tarih ? 'hata' : ''}`} placeholder="AA/YY" maxLength="5" required
                                    value={kart.tarih} onChange={e => {
                                        let val = e.target.value.replace(/[^0-9]/g, '');
                                        if (val.length > 2) val = val.substring(0, 2) + '/' + val.substring(2, 4);
                                        setKart({ ...kart, tarih: val });
                                    }} />
                                {hatalar.tarih && <span className="hata-mesaji">{hatalar.tarih}</span>}
                            </div>
                            <div className="form-grup">
                                <label>CVV</label>
                                <input type="password" className={`form-kontrol ${hatalar.cvv ? 'hata' : ''}`} placeholder="•••" maxLength="3" required
                                    value={kart.cvv} onChange={e => setKart({ ...kart, cvv: e.target.value.replace(/[^0-9]/g, '') })} />
                                {hatalar.cvv && <span className="hata-mesaji">{hatalar.cvv}</span>}
                            </div>
                        </div>
                        <button type="submit" className="dugme dugme-bir" style={{ width: '100%', justifyContent: 'center', marginTop: '24px' }} disabled={odemeYapiliyor}>
                            {odemeYapiliyor ? <div className="yuk"></div> : <><FiLock /> ₺{paket?.price?.toLocaleString()} Öde</>}
                        </button>
                    </form>
                </div>

                {/* ---- Sipariş Özeti ---- */}
                <div className="kart" style={{ height: 'fit-content' }}>
                    <h3 style={{ fontSize: '20px', marginBottom: '24px' }}>📦 Sipariş Özeti</h3>
                    <div style={{ padding: '16px 0', borderBottom: '1px solid rgba(255,255,255,0.1)' }}>
                        <div>
                            <div style={{ fontWeight: 600, color: '#f1f5f9' }}>{paket?.name}</div>
                            <div style={{ fontSize: '13px', color: '#64748b' }}>{paket?.durationDays} Günlük Üyelik</div>
                        </div>
                        <div style={{ fontWeight: 600, color: '#f1f5f9' }}>₺{paket?.price?.toLocaleString()}</div>
                    </div>
                    <div style={{ padding: '16px 0', borderBottom: '1px solid rgba(255,255,255,0.1)', display: 'flex', justifyContent: 'space-between' }}>
                        <span style={{ color: '#94a3b8' }}>Hizmet Bedeli</span>
                        <span style={{ color: '#34d399', fontWeight: 600 }}>Ücretsiz</span>
                    </div>
                    <div style={{ padding: '20px 0', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <span style={{ fontSize: '18px', fontWeight: 600 }}>Toplam</span>
                        <span style={{ fontSize: '24px', fontWeight: 700, color: '#6c63ff' }}>₺{paket?.price?.toLocaleString()}</span>
                    </div>

                    <div style={{ marginTop: '24px', padding: '16px', background: 'rgba(52, 211, 153, 0.05)', borderRadius: '12px', border: '1px solid rgba(52, 211, 153, 0.1)', fontSize: '13px', color: '#94a3b8' }}>
                        <p style={{ margin: 0 }}>🛡️ Ödemeniz 256-bit SSL sertifikası ile korunmaktadır. Kart bilgileriniz sunucularımızda saklanmaz.</p>
                    </div>
                </div>
            </div>
        </div >
    );
};

export default PaymentPage;
