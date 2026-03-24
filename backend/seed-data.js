// Doğrudan çalışan backend'in MongoDB'sine bağlanarak örnek verileri ekler
// Backend'in çalışıyor olması gerekir (port 5001)
const http = require('http');

const BASE = 'http://localhost:5001';

function api(method, path, data) {
    return new Promise((resolve, reject) => {
        const url = new URL(path, BASE);
        const body = data ? JSON.stringify(data) : null;
        const req = http.request(url, {
            method,
            headers: { 'Content-Type': 'application/json', ...(api.token ? { Authorization: 'Bearer ' + api.token } : {}) }
        }, (res) => {
            let d = '';
            res.on('data', c => d += c);
            res.on('end', () => {
                try { resolve(JSON.parse(d)); } catch { resolve(d); }
            });
        });
        req.on('error', reject);
        if (body) req.write(body);
        req.end();
    });
}

async function main() {
    // 1. Admin olarak giriş yap (paket oluşturmak için)
    console.log('🔐 Admin girişi...');
    const admin = await api('POST', '/api/auth/login', { email: 'aysenur@gympro.com', password: 'Ayse1234*' });
    api.token = admin.token;

    // 2. Paketler oluştur
    console.log('📦 Paketler oluşturuluyor...');
    const pkg1 = await api('POST', '/api/admin/packages', { name: 'Aylık Temel', description: 'Aylık temel üyelik paketi', price: 500, durationDays: 30, maxClasses: 12 });
    const pkg2 = await api('POST', '/api/admin/packages', { name: '3 Aylık Premium', description: '3 aylık premium üyelik paketi', price: 1200, durationDays: 90, maxClasses: 48 });
    const pkg3 = await api('POST', '/api/admin/packages', { name: 'Yıllık VIP', description: 'Yıllık sınırsız üyelik paketi', price: 4000, durationDays: 365, maxClasses: 0 });
    console.log('  ✅ 3 paket oluşturuldu');

    // 3. Üyeleri al
    const users = await api('GET', '/api/admin/users?role=member');
    const ahmet = users.find(u => u.email === 'ahmet@gympro.com');
    const zeynep = users.find(u => u.email === 'zeynep@gympro.com');
    const mehmet = users.find(u => u.email === 'mehmet@gympro.com');

    // 4. Antrenörü al
    const trainers = await api('GET', '/api/admin/users?role=trainer');
    const fatma = trainers.find(u => u.email === 'fatma@gympro.com');

    // 5. Antrenör olarak giriş - Programlar oluştur
    console.log('🏋️ Antrenör programları oluşturuluyor...');
    const trainerLogin = await api('POST', '/api/auth/login', { email: 'fatma@gympro.com', password: 'Fatma1234*' });
    api.token = trainerLogin.token;

    const programs = [
        { title: 'Sabah Yogası', description: 'Güne enerjik başlamak için yoga dersi', dayOfWeek: 'Pazartesi', time: '08:00', maxCapacity: 15 },
        { title: 'Fonksiyonel Antrenman', description: 'Tüm vücut fonksiyonel egzersizler', dayOfWeek: 'Salı', time: '10:00', maxCapacity: 12 },
        { title: 'Pilates', description: 'Core güçlendirme ve esneklik', dayOfWeek: 'Çarşamba', time: '09:00', maxCapacity: 10 },
        { title: 'HIIT Kardiyo', description: 'Yüksek yoğunluklu interval antrenman', dayOfWeek: 'Perşembe', time: '18:00', maxCapacity: 20 },
        { title: 'Zumba', description: 'Dans ile eğlenceli kardiyo', dayOfWeek: 'Cuma', time: '17:00', maxCapacity: 25 },
        { title: 'CrossFit', description: 'Güç ve dayanıklılık antrenmanı', dayOfWeek: 'Cumartesi', time: '10:00', maxCapacity: 15 }
    ];

    for (const p of programs) {
        await api('POST', '/api/trainer/programs', p);
    }
    console.log('  ✅ 6 program oluşturuldu');

    // 6. Devam kayıtları (Attendance)
    console.log('📋 Devam kayıtları oluşturuluyor...');
    if (ahmet) await api('POST', '/api/trainer/attendance', { userId: ahmet._id });
    if (zeynep) await api('POST', '/api/trainer/attendance', { userId: zeynep._id });
    if (mehmet) await api('POST', '/api/trainer/attendance', { userId: mehmet._id });
    console.log('  ✅ Bugünkü devam kayıtları oluşturuldu');

    // 7. Admin olarak giriş - Enrollment ve Payment verilerini doğrudan DB'ye eklemek için
    // Bu kısımda mongoose kullanmamız lazım, API üzerinden enrollment/payment oluşturalım
    // member route'a bakalım
    console.log('\n💰 Enrollment ve ödeme verileri oluşturuluyor...');

    // Ahmet - Aylık Temel paket
    if (ahmet && pkg1._id) {
        const ahmetLogin = await api('POST', '/api/auth/login', { email: 'ahmet@gympro.com', password: 'Uye12345*' });
        api.token = ahmetLogin.token;
        await api('POST', '/api/member/enroll', { packageId: pkg1._id });
        console.log('  ✅ Ahmet → Aylık Temel pakete kayıt oldu');
    }

    // Zeynep - 3 Aylık Premium paket
    if (zeynep && pkg2._id) {
        const zeynepLogin = await api('POST', '/api/auth/login', { email: 'zeynep@gympro.com', password: 'Uye12345*' });
        api.token = zeynepLogin.token;
        await api('POST', '/api/member/enroll', { packageId: pkg2._id });
        console.log('  ✅ Zeynep → 3 Aylık Premium pakete kayıt oldu');
    }

    // Mehmet - Yıllık VIP paket
    if (mehmet && pkg3._id) {
        const mehmetLogin = await api('POST', '/api/auth/login', { email: 'mehmet@gympro.com', password: 'Uye12345*' });
        api.token = mehmetLogin.token;
        await api('POST', '/api/member/enroll', { packageId: pkg3._id });
        console.log('  ✅ Mehmet → Yıllık VIP pakete kayıt oldu');
    }

    console.log('\n🎉 Tüm örnek veriler başarıyla oluşturuldu!');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('📦 3 Paket: Aylık Temel, 3 Aylık Premium, Yıllık VIP');
    console.log('🏋️ 6 Program: Yoga, Fonksiyonel, Pilates, HIIT, Zumba, CrossFit');
    console.log('📋 3 Devam kaydı (bugün)');
    console.log('💳 3 Üyelik kaydı + ödemeler');
}

main().catch(console.error);
