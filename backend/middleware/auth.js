// ==========================================
// Kimlik Doğrulama Middleware'leri
// JWT token kontrolü ve rol bazlı yetkilendirme
// ==========================================

const jwt = require('jsonwebtoken');
const { User } = require('../db/models');

// ---- Token Doğrulama (Koruma) ----
// İstekteki JWT token'ı kontrol eder, geçerliyse kullanıcıyı req.user'a ekler
const korumaKontrol = async (istek, yanit, sonraki) => {
    try {
        // Authorization başlığından token'ı al
        const baslik = istek.headers.authorization;
        if (!baslik || !baslik.startsWith('Bearer'))
            return yanit.status(401).json({ message: 'Yetkisiz erişim - Token bulunamadı' });

        const token = baslik.split(' ')[1];

        // Token'ı doğrula ve kullanıcı bilgilerini çöz
        const cozulmus = jwt.verify(token, process.env.JWT_SECRET);

        // Kullanıcıyı veritabanından getir
        const kullanici = await User.findByPk(cozulmus.id, {
            attributes: ['_id', 'name', 'email', 'role', 'phone', 'isActive', 'createdAt', 'updatedAt']
        });
        if (!kullanici || !kullanici.isActive)
            return yanit.status(401).json({ message: 'Kullanıcı bulunamadı' });

        istek.user = kullanici.toJSON();
        sonraki();
    } catch (hata) {
        yanit.status(401).json({ message: 'Geçersiz token' });
    }
};

// ---- Rol Bazlı Yetkilendirme ----
// Sadece belirtilen rollere sahip kullanıcıların erişimine izin verir
const yetkilendirme = (...izinliRoller) => {
    return (istek, yanit, sonraki) => {
        if (!izinliRoller.includes(istek.user.role))
            return yanit.status(403).json({ message: 'Bu işlem için yetkiniz yok' });
        sonraki();
    };
};

module.exports = { protect: korumaKontrol, authorize: yetkilendirme };
