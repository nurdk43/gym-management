const http = require('http');
const BASE = 'http://localhost:5001';

function api(method, path, data, token) {
    return new Promise((resolve, reject) => {
        const url = new URL(path, BASE);
        const body = data ? JSON.stringify(data) : null;
        const req = http.request(url, {
            method,
            headers: {
                'Content-Type': 'application/json',
                ...(token ? { Authorization: 'Bearer ' + token } : {})
            }
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
    console.log('🚀 Veri çoğaltma işlemi başlatılıyor...');

    // 1. Admin login
    const admin = await api('POST', '/api/auth/login', { email: 'aysenur@gympro.com', password: 'Ayse1234*' });
    if (!admin.token) throw new Error('Admin girişi başarısız');
    const token = admin.token;

    // 2. Daha fazla antrenör ekle
    console.log('🏋️ Yeni antrenörler ekleniyor...');
    const newTrainers = [
        { name: 'Caner Özcan', email: 'caner@gympro.com', password: 'Caner1234*', role: 'trainer', phone: '0555 666 6666' },
        { name: 'Selin Aktaş', email: 'selin@gympro.com', password: 'Selin1234*', role: 'trainer', phone: '0555 777 7777' },
        { name: 'Murat Aydın', email: 'murat@gympro.com', password: 'Murat1234*', role: 'trainer', phone: '0555 888 8888' }
    ];

    for (const t of newTrainers) {
        const res = await api('POST', '/api/auth/register', t);
        if (res.user) console.log(`  ✅ ${t.name} antrenör olarak eklendi`);
        else console.log(`  ⏭️ ${t.name} zaten mevcut olabilir`);
    }

    // 3. Daha fazla üye ekle
    console.log('👤 Yeni üyeler ekleniyor...');
    const newMembers = [
        { name: 'Buse Çelik', email: 'buse@gympro.com', password: 'Uye12345*', role: 'member', phone: '0555 999 9999' },
        { name: 'Kerem Öztürk', email: 'kerem@gympro.com', password: 'Uye12345*', role: 'member', phone: '0555 000 0000' },
        { name: 'Elif Şahin', email: 'elif@gympro.com', password: 'Uye12345*', role: 'member', phone: '0544 111 2222' },
        { name: 'Burak Yılmaz', email: 'burak@gympro.com', password: 'Uye12345*', role: 'member', phone: '0544 333 4444' },
        { name: 'Deniz Koç', email: 'deniz@gympro.com', password: 'Uye12345*', role: 'member', phone: '0544 555 6666' }
    ];

    for (const m of newMembers) {
        const res = await api('POST', '/api/auth/register', m);
        if (res.user) console.log(`  ✅ ${m.name} üye olarak eklendi`);
        else console.log(`  ⏭️ ${m.name} zaten mevcut olabilir`);
    }

    // 4. Yeni Paketler
    console.log('📦 Yeni paketler ekleniyor...');
    const newPackages = [
        { name: 'Öğrenci Paketi', description: 'Öğrencilere özel indirimli aylık paket', price: 350, durationDays: 30, maxClasses: 8 },
        { name: 'Hafta Sonu Paketi', description: 'Sadece Cumartesi-Pazar kullanımı', price: 250, durationDays: 30, maxClasses: 8 },
        { name: '6 Aylık Standart', description: '6 aylık ekonomik çözüm', price: 2200, durationDays: 180, maxClasses: 72 }
    ];

    for (const p of newPackages) {
        await api('POST', '/api/admin/packages', p, token);
        console.log(`  ✅ ${p.name} paketi oluşturuldu`);
    }

    // 5. Yeni Antrenörler için Programlar
    console.log('📅 Yeni ders programları ekleniyor...');

    // Caner için programlar
    const canerLogin = await api('POST', '/api/auth/login', { email: 'caner@gympro.com', password: 'Caner1234*' });
    if (canerLogin.token) {
        const programs = [
            { title: 'Kick Boks', description: 'Temel kick boks teknikleri', dayOfWeek: 'Salı', time: '19:00', maxCapacity: 12 },
            { title: 'Boks Antrenmanı', description: 'Kondisyon ve teknik boks', dayOfWeek: 'Perşembe', time: '19:00', maxCapacity: 10 }
        ];
        for (const p of programs) await api('POST', '/api/trainer/programs', p, canerLogin.token);
        console.log('  ✅ Caner için 2 ders eklendi');
    }

    // Selin için programlar
    const selinLogin = await api('POST', '/api/auth/login', { email: 'selin@gympro.com', password: 'Selin1234*' });
    if (selinLogin.token) {
        const programs = [
            { title: 'Yoga Advanced', description: 'İleri seviye yoga pratikleri', dayOfWeek: 'Çarşamba', time: '07:30', maxCapacity: 15 },
            { title: 'Meditasyon', description: 'Zihinsel arınma ve nefes', dayOfWeek: 'Pazar', time: '10:00', maxCapacity: 20 }
        ];
        for (const p of programs) await api('POST', '/api/trainer/programs', p, selinLogin.token);
        console.log('  ✅ Selin için 2 ders eklendi');
    }

    // Murat için programlar
    const muratLogin = await api('POST', '/api/auth/login', { email: 'murat@gympro.com', password: 'Murat1234*' });
    if (muratLogin.token) {
        const programs = [
            { title: 'Bodybuilding', description: 'Kas kütlesi artırma odaklı', dayOfWeek: 'Pazartesi', time: '18:00', maxCapacity: 8 },
            { title: 'Powerlifting', description: 'Güç ve teknik odaklı', dayOfWeek: 'Cuma', time: '18:00', maxCapacity: 6 }
        ];
        for (const p of programs) await api('POST', '/api/trainer/programs', p, muratLogin.token);
        console.log('  ✅ Murat için 2 ders eklendi');
    }

    console.log('\n✨ Veri çoğaltma tamamlandı!');
}

main().catch(console.error);
