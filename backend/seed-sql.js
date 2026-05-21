require('dotenv').config();

const bcrypt = require('bcryptjs');
const crypto = require('crypto');

const { initDB, getSequelize } = require('./db/sequelize');
const { ensureDatabaseExists } = require('./db/bootstrap-mysql');
const { User, Package, Program, ProgramMember, Enrollment, Payment, Attendance } = require('./db/models');

function dateRange(start, end) {
  const out = [];
  const cursor = new Date(start);
  while (cursor <= end) {
    out.push(new Date(cursor));
    cursor.setDate(cursor.getDate() + 1);
  }
  return out;
}

function formatDateOnly(d) {
  return d.toISOString().slice(0, 10);
}

function dayOfWeekTR(date) {
  const days = ['Pazar', 'Pazartesi', 'Salı', 'Çarşamba', 'Perşembe', 'Cuma', 'Cumartesi'];
  return days[date.getDay()];
}

async function main() {
  await ensureDatabaseExists();
  await initDB();
  const sequelize = getSequelize();
  await sequelize.sync();

  console.log('🔁 SQL seed işlemi başlatılıyor...');

  // --- Kullanıcılar ---
  const kullanicilar = [
    {
      name: 'Ayşenur Dik',
      email: 'aysenur@gympro.com',
      password: 'Ayse1234*',
      role: 'admin',
      phone: '0555 111 1111'
    },
    {
      name: 'Fatma Yılmaz',
      email: 'fatma@gympro.com',
      password: 'Fatma1234*',
      role: 'trainer',
      phone: '0555 222 2222'
    },
    {
      name: 'Ahmet Yıldız',
      email: 'ahmet@gympro.com',
      password: 'Uye12345*',
      role: 'member',
      phone: '0555 333 3333'
    },
    {
      name: 'Zeynep Kaya',
      email: 'zeynep@gympro.com',
      password: 'Uye12345*',
      role: 'member',
      phone: '0555 444 4444'
    },
    {
      name: 'Mehmet Demir',
      email: 'mehmet@gympro.com',
      password: 'Uye12345*',
      role: 'member',
      phone: '0555 555 5555'
    }
  ];

  for (const u of kullanicilar) {
    const email = u.email.toLowerCase();
    const mevcut = await User.findOne({ where: { email } });
    if (mevcut) {
      console.log(`⏭️  ${email} zaten var, atlanıyor`);
      continue;
    }

    const hash = await bcrypt.hash(u.password, 10);

    await User.create({
      _id: crypto.randomUUID(),
      name: u.name,
      email,
      password: hash,
      role: u.role,
      phone: u.phone,
      isActive: true
    });

    console.log(`✅ Kullanıcı eklendi: ${email} (${u.role})`);
  }

  // --- Paketler ---
  const paketler = [
    {
      name: 'Aylık Temel',
      description: 'Aylık temel üyelik paketi',
      price: 500,
      durationDays: 30,
      maxClasses: 12
    },
    {
      name: '3 Aylık Premium',
      description: '3 aylık premium üyelik paketi',
      price: 1200,
      durationDays: 90,
      maxClasses: 48
    },
    {
      name: 'Yıllık VIP',
      description: 'Yıllık sınırsız üyelik paketi',
      price: 4000,
      durationDays: 365,
      maxClasses: 0
    }
  ];

  for (const p of paketler) {
    const mevcut = await Package.findOne({ where: { name: p.name } });
    if (mevcut) {
      console.log(`⏭️  Paket zaten var: ${p.name}`);
      continue;
    }

    await Package.create({
      _id: crypto.randomUUID(),
      name: p.name,
      description: p.description,
      price: p.price,
      durationDays: p.durationDays,
      maxClasses: p.maxClasses,
      isActive: true
    });

    console.log(`✅ Paket eklendi: ${p.name}`);
  }

  // --- Ek antrenör/üye (demo için) ---
  const ekKullanicilar = [
    { name: 'Caner Özcan', email: 'caner@gympro.com', password: 'Caner1234*', role: 'trainer', phone: '0555 666 6666' },
    { name: 'Selin Aktaş', email: 'selin@gympro.com', password: 'Selin1234*', role: 'trainer', phone: '0555 777 7777' },
    { name: 'Murat Aydın', email: 'murat@gympro.com', password: 'Murat1234*', role: 'trainer', phone: '0555 888 8888' },
    { name: 'Buse Çelik', email: 'buse@gympro.com', password: 'Uye12345*', role: 'member', phone: '0555 999 9999' },
    { name: 'Kerem Öztürk', email: 'kerem@gympro.com', password: 'Uye12345*', role: 'member', phone: '0555 000 0000' },
    { name: 'Elif Şahin', email: 'elif@gympro.com', password: 'Uye12345*', role: 'member', phone: '0544 111 2222' },
    { name: 'Burak Yılmaz', email: 'burak@gympro.com', password: 'Uye12345*', role: 'member', phone: '0544 333 4444' },
    { name: 'Deniz Koç', email: 'deniz@gympro.com', password: 'Uye12345*', role: 'member', phone: '0544 555 6666' }
  ];

  for (const u of ekKullanicilar) {
    const email = u.email.toLowerCase();
    const mevcut = await User.findOne({ where: { email } });
    if (mevcut) continue;
    const hash = await bcrypt.hash(u.password, 10);
    await User.create({
      _id: crypto.randomUUID(),
      name: u.name,
      email,
      password: hash,
      role: u.role,
      phone: u.phone,
      isActive: true
    });
    console.log(`✅ Kullanıcı eklendi: ${email} (${u.role})`);
  }

  // --- Programlar + kayıtlar + geçmiş veriler ---
  const trainerFatma = await User.findOne({ where: { email: 'fatma@gympro.com' } });
  const trainerCaner = await User.findOne({ where: { email: 'caner@gympro.com' } });
  const trainerSelin = await User.findOne({ where: { email: 'selin@gympro.com' } });
  const trainerMurat = await User.findOne({ where: { email: 'murat@gympro.com' } });

  const allMembers = await User.findAll({ where: { role: 'member' }, attributes: ['_id', 'email', 'name', 'isActive'] });
  const hedefAktifUye = Math.max(1, Math.floor(allMembers.length * 0.8));
  for (let i = 0; i < allMembers.length; i++) {
    const shouldBeActive = i < hedefAktifUye;
    if (allMembers[i].isActive !== shouldBeActive) {
      await User.update({ isActive: shouldBeActive }, { where: { _id: allMembers[i]._id } });
    }
  }

  const uyeler = await User.findAll({ where: { role: 'member', isActive: true }, attributes: ['_id', 'email', 'name'] });
  const paketList = await Package.findAll();
  const startDate = new Date('2026-04-01T00:00:00');
  const endDate = new Date('2026-05-31T00:00:00');
  const tumGunler = dateRange(startDate, endDate);
  const saatler = ['08:00', '10:00', '12:00', '14:00', '16:00', '18:00'];

  const trainerList = [trainerFatma, trainerCaner, trainerSelin, trainerMurat].filter(Boolean);
  const dersAdlari = ['Sabah Yogası', 'Fonksiyonel Antrenman', 'Kick Boks', 'Yoga Advanced', 'Bodybuilding'];
  for (let i = 0; i < tumGunler.length; i++) {
    const tarih = tumGunler[i];
    const trainer = trainerList[i % trainerList.length];
    if (!trainer) continue;
    const classDate = formatDateOnly(tarih);
    const time = saatler[i % saatler.length];
    const title = `${dersAdlari[i % dersAdlari.length]} ${classDate}`;
    const mevcut = await Program.findOne({ where: { trainerId: trainer._id, title, time } });
    if (mevcut) continue;
    await Program.create({
      _id: crypto.randomUUID(),
      title,
      description: `${title} dersi`,
      trainerId: trainer._id,
      dayOfWeek: dayOfWeekTR(tarih),
      time,
      maxCapacity: 15,
      isActive: true
    });
    console.log(`✅ Program eklendi: ${title}`);
  }

  const programlar = await Program.findAll({ attributes: ['_id', 'maxCapacity'] });

  // Üyeleri programlara kaydet (ProgramMember)
  for (let i = 0; i < uyeler.length; i++) {
    const uye = uyeler[i];
    const hedefProgramlar = programlar.slice(i % programlar.length, Math.min(programlar.length, (i % programlar.length) + 2));
    for (const pr of hedefProgramlar) {
      const varMi = await ProgramMember.findOne({ where: { program: pr._id, member: uye._id } });
      if (!varMi) await ProgramMember.create({ program: pr._id, member: uye._id });
    }
  }

  // Üyelik + ödeme geçmişi (son 60 gün içinde rastgele)
  for (let i = 0; i < uyeler.length; i++) {
    const uye = uyeler[i];
    const paket = paketList[i % paketList.length];
    if (!paket) continue;

    const once = await Enrollment.findOne({ where: { userId: uye._id, packageId: paket._id } });
    if (once) continue;

    const baslangic = new Date();
    baslangic.setDate(baslangic.getDate() - (5 + (i % 50)));
    const bitis = new Date(baslangic);
    bitis.setDate(bitis.getDate() + paket.durationDays);

    const enrollment = await Enrollment.create({
      _id: crypto.randomUUID(),
      userId: uye._id,
      packageId: paket._id,
      startDate: baslangic,
      endDate: bitis,
      status: bitis > new Date() ? 'active' : 'expired'
    });

    await Payment.create({
      _id: crypto.randomUUID(),
      userId: uye._id,
      enrollmentId: enrollment._id,
      amount: paket.price,
      method: i % 2 === 0 ? 'card' : 'cash',
      paidAt: baslangic
    });
  }

  // Attendance geçmişi (1 Nisan - 31 Mayıs, her gün)
  const trainerlar = trainerList;
  for (let g = 0; g < tumGunler.length; g++) {
    const tarih = tumGunler[g];
    for (const trainer of trainerlar) {
      const uye = uyeler[(g + trainerlar.indexOf(trainer)) % uyeler.length];
      if (!uye) continue;
      await Attendance.create({
        _id: crypto.randomUUID(),
        trainerId: trainer._id,
        userId: uye._id,
        date: tarih,
        checkIn: new Date(new Date(tarih).setHours(9 + (g % 8), 0, 0, 0)),
        checkOut: new Date(tarih.getTime() + 60 * 60 * 1000)
      });
    }
  }

  console.log('\n🎉 SQL seed tamamlandı.');
  console.log(`📊 Toplam üye: ${allMembers.length}, aktif üye: ${hedefAktifUye}`);
  await sequelize.close();
  process.exit(0);
}

main().catch((err) => {
  console.error('❌ Seed hatası:', err.message);
  process.exit(1);
});

