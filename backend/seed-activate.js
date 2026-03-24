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
    console.log('⚡ Verileri aktifleştirme işlemi başlatılıyor...');

    // 1. Admin login - Verileri çekmek için
    const admin = await api('POST', '/api/auth/login', { email: 'aysenur@gympro.com', password: 'Ayse1234*' });
    const adminToken = admin.token;

    // 2. Paketleri, Üyeleri ve Programları al
    const packages = await api('GET', '/api/admin/packages', null, adminToken);
    const users = await api('GET', '/api/admin/users?role=member', null, adminToken);

    // Yeni üyeler: Buse, Kerem, Elif, Burak, Deniz
    const targetEmails = ['buse@gympro.com', 'kerem@gympro.com', 'elif@gympro.com', 'burak@gympro.com', 'deniz@gympro.com'];
    const newMembers = users.filter(u => targetEmails.includes(u.email));

    const buseLogin = await api('POST', '/api/auth/login', { email: 'buse@gympro.com', password: 'Uye12345*' });
    const classesRes = await api('GET', '/api/member/classes', null, buseLogin.token);
    const classes = Array.isArray(classesRes) ? classesRes : [];

    // Yeni paketler: Öğrenci, Hafta Sonu, 6 Aylık
    const targetPkgNames = ['Öğrenci Paketi', 'Hafta Sonu Paketi', '6 Aylık Standart'];
    const newPkgs = packages.filter(p => targetPkgNames.includes(p.name));

    console.log('💰 Üyeler paketlere kaydediliyor ve ödemeler oluşturuluyor...');
    for (let i = 0; i < newMembers.length; i++) {
        const member = newMembers[i];
        const pkg = newPkgs[i % newPkgs.length] || packages[0]; // Paketleri dağıt

        // Üye olarak giriş yapıp kayıt ol
        const login = await api('POST', '/api/auth/login', { email: member.email, password: 'Uye12345*' });
        if (login.token) {
            await api('POST', '/api/member/enroll', { packageId: pkg._id, method: i % 2 === 0 ? 'card' : 'cash' }, login.token);
            console.log(`  ✅ ${member.name} → ${pkg.name} paketine kaydedildi`);
        }
    }

    console.log('🏃 Üyeler derslere kaydediliyor...');
    // Her üyeyi birkaç derse kaydet (özellikle yeni antrenörlerin derslerine)
    for (let i = 0; i < newMembers.length; i++) {
        const member = newMembers[i];
        const login = await api('POST', '/api/auth/login', { email: member.email, password: 'Uye12345*' });

        if (login.token && classes.length > 0) {
            // Rastgele 2 derse kaydet
            const randomClasses = [...classes].sort(() => 0.5 - Math.random()).slice(0, 2);
            for (const cls of randomClasses) {
                await api('POST', '/api/member/classes/enroll', { programId: cls._id }, login.token);
            }
            console.log(`  ✅ ${member.name} 2 derse kaydedildi`);
        }
    }

    console.log('📋 Geçmiş devam kayıtları oluşturuluyor (Raporlar için)...');
    // Yeni antrenörler: Caner, Selin, Murat
    const trainers = await api('GET', '/api/admin/users?role=trainer', null, adminToken);
    const newTrainers = trainers.filter(t => ['caner@gympro.com', 'selin@gympro.com', 'murat@gympro.com'].includes(t.email));

    for (const trainer of newTrainers) {
        const login = await api('POST', '/api/auth/login', { email: trainer.email, password: trainer.name.split(' ')[0] + '1234*' });
        if (login.token) {
            // Her antrenör kendi dersine gelen birkaç üye için bugün check-in yapsın
            const randomMembers = newMembers.sort(() => 0.5 - Math.random()).slice(0, 2);
            for (const m of randomMembers) {
                await api('POST', '/api/trainer/attendance', { userId: m._id }, login.token);
            }
            console.log(`  ✅ ${trainer.name} için devam kayıtları eklendi`);
        }
    }

    console.log('\n✨ Tüm yeni veriler aktifleştirildi ve raporlara dahil edildi!');
}

main().catch(console.error);
