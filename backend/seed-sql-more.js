require('dotenv').config();

const bcrypt = require('bcryptjs');
const crypto = require('crypto');

const { ensureDatabaseExists } = require('./db/bootstrap-mysql');
const { initDB, getSequelize } = require('./db/sequelize');
const {
  User,
  Package,
  Program,
  ProgramMember,
  Enrollment,
  Payment,
  Attendance
} = require('./db/models');

function rand(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function pick(arr) {
  return arr[rand(0, arr.length - 1)];
}

function randomPastDate(daysBack) {
  const d = new Date();
  d.setDate(d.getDate() - rand(1, daysBack));
  d.setHours(rand(6, 21), rand(0, 59), 0, 0);
  return d;
}

function formatDateOnly(d) {
  return d.toISOString().slice(0, 10);
}

function dateRange(start, end) {
  const out = [];
  const cursor = new Date(start);
  while (cursor <= end) {
    out.push(new Date(cursor));
    cursor.setDate(cursor.getDate() + 1);
  }
  return out;
}

function dayOfWeekTR(date) {
  const days = ['Pazar', 'Pazartesi', 'Salı', 'Çarşamba', 'Perşembe', 'Cuma', 'Cumartesi'];
  return days[date.getDay()];
}

async function createUserIfMissing({ name, email, password, role, phone }) {
  const lower = email.toLowerCase();
  const existing = await User.findOne({ where: { email: lower } });
  if (existing) return existing;

  const hash = await bcrypt.hash(password, 10);
  return await User.create({
    _id: crypto.randomUUID(),
    name,
    email: lower,
    password: hash,
    role,
    phone,
    isActive: true
  });
}

async function main() {
  await ensureDatabaseExists();
  await initDB();
  const sequelize = getSequelize();
  await sequelize.sync();

  console.log('🚀 Geniş SQL veri üretimi başlıyor...');

  // ---- Ekstra antrenörler ----
  const trainerNames = [
    'Ece Arslan', 'Tolga Şen', 'Aslı Korkmaz', 'Berkay Kaya', 'Nazlı Acar', 'Onur Çetin'
  ];
  const trainers = [];
  for (let i = 0; i < trainerNames.length; i++) {
    const first = trainerNames[i].split(' ')[0];
    const email = `${first.toLowerCase()}${i + 1}@gympro.com`;
    const t = await createUserIfMissing({
      name: trainerNames[i],
      email,
      password: `${first}1234*`,
      role: 'trainer',
      phone: `0532 77${i}${i} ${rand(10, 99)} ${rand(10, 99)}`
    });
    trainers.push(t);
  }

  // ---- Ekstra üyeler ----
  const memberFirstNames = [
    'Ayça', 'Merve', 'Sude', 'Derya', 'Rana', 'Gizem', 'Melis', 'Sena', 'Barış', 'Cem',
    'Emre', 'Kaan', 'Mert', 'Yusuf', 'Can', 'Ali', 'Deniz', 'Efe', 'Ozan', 'Hakan'
  ];
  const memberLastNames = ['Yılmaz', 'Kaya', 'Demir', 'Şahin', 'Çelik', 'Aydın', 'Koç', 'Arı'];
  const members = [];
  for (let i = 0; i < 35; i++) {
    const first = pick(memberFirstNames);
    const last = pick(memberLastNames);
    const name = `${first} ${last}`;
    const email = `${first.toLowerCase()}.${last.toLowerCase()}.${i + 1}@gympro.com`;
    const m = await createUserIfMissing({
      name,
      email,
      password: 'Uye12345*',
      role: 'member',
      phone: `054${rand(0, 9)} ${rand(100, 999)} ${rand(10, 99)} ${rand(10, 99)}`
    });
    members.push(m);
  }

  const allTrainers = await User.findAll({ where: { role: 'trainer', isActive: true } });
  const allMembers = await User.findAll({ where: { role: 'member' } });
  const packages = await Package.findAll();
  if (!allTrainers.length || !allMembers.length || !packages.length) {
    throw new Error('Seed için trainer/member/package verisi eksik.');
  }
  const totalMembers = allMembers.length;
  const targetActiveMembers = Math.max(1, Math.floor(totalMembers * 0.6));

  for (let i = 0; i < allMembers.length; i++) {
    const shouldBeActive = i < targetActiveMembers;
    if (allMembers[i].isActive !== shouldBeActive) {
      await allMembers[i].update({ isActive: shouldBeActive });
    }
  }

  const activeMembers = await User.findAll({ where: { role: 'member', isActive: true } });

  // ---- Nisan-Mayıs için günlük, çakışmasız dersler ----
  const classTemplates = [
    'Core Power', 'Pilates Flow', 'HIIT Blast', 'Functional Fit', 'Upper Body', 'Lower Body',
    'Morning Cardio', 'Stretch & Mobility', 'TRX Basics', 'Boxing Drills', 'Kickboxing',
    'Zumba Party', 'Spinning Pro', 'Cross Circuit', 'Strength 101'
  ];
  const timeSlots = ['07:00', '08:30', '10:00', '12:00', '14:00', '16:00', '18:00', '19:30'];
  const startDate = new Date('2026-04-01T00:00:00');
  const endDate = new Date('2026-05-31T00:00:00');
  const allDates = dateRange(startDate, endDate);
  let newProgramCount = 0;

  for (let di = 0; di < allDates.length; di++) {
    const currentDate = allDates[di];
    const sessionCount = 2 + (di % 2); // günlük 2-3 ders
    for (let si = 0; si < sessionCount; si++) {
      const trainer = allTrainers[(di + si) % allTrainers.length];
      if (!trainer) continue;
      const classDate = formatDateOnly(currentDate);
      const time = timeSlots[(di * 3 + si) % timeSlots.length]; // aynı gün/saat çakışmaz
      const title = `${pick(classTemplates)} - ${classDate} #${si + 1}`;

      const exists = await Program.findOne({ where: { trainerId: trainer._id, title, time } });
      if (exists) continue;

      await Program.create({
        _id: crypto.randomUUID(),
        title,
        description: `${title} dersi`,
        trainerId: trainer._id,
        dayOfWeek: dayOfWeekTR(currentDate),
        time,
        maxCapacity: rand(8, 28),
        isActive: true
      });
      newProgramCount += 1;
    }
  }

  const programs = await Program.findAll({ where: { isActive: true } });

  // ---- Ders kayıtları (program üyeleri) ----
  let newProgramMemberRows = 0;
  for (const member of activeMembers) {
    const targetCount = rand(1, 3);
    for (let i = 0; i < targetCount; i++) {
      const p = pick(programs);
      const exists = await ProgramMember.findOne({ where: { program: p._id, member: member._id } });
      if (exists) continue;
      await ProgramMember.create({ program: p._id, member: member._id });
      newProgramMemberRows += 1;
    }
  }

  // ---- Üyelik + ödeme geçmişi ----
  let newEnrollments = 0;
  let newPayments = 0;
  for (let mi = 0; mi < allMembers.length; mi++) {
    const member = allMembers[mi];
    const includeActiveEnrollment = mi < targetActiveMembers; // aktif üye sayısı toplamdan düşük
    const expiredHistoryCount = rand(0, 1);

    for (let i = 0; i < expiredHistoryCount; i++) {
      const pack = pick(packages);
      if (!pack) continue;

      const start = randomPastDate(240);
      const end = new Date(start);
      end.setDate(end.getDate() + Math.max(10, Math.floor(pack.durationDays * 0.5)));
      if (end > new Date('2026-03-31T23:59:59')) {
        end.setTime(new Date('2026-03-31T23:59:59').getTime());
      }

      const enrollment = await Enrollment.create({
        _id: crypto.randomUUID(),
        userId: member._id,
        packageId: pack._id,
        startDate: start,
        endDate: end,
        status: 'expired'
      });
      newEnrollments += 1;

      await Payment.create({
        _id: crypto.randomUUID(),
        userId: member._id,
        enrollmentId: enrollment._id,
        amount: pack.price,
        method: pick(['card', 'cash', 'transfer']),
        paidAt: start
      });
      newPayments += 1;
    }

    if (includeActiveEnrollment) {
      const activePack = packages[mi % packages.length];
      if (activePack) {
        const start = new Date('2026-04-01T08:00:00');
        start.setDate(start.getDate() + (mi % 30));
        const end = new Date(start);
        end.setDate(end.getDate() + activePack.durationDays);

        const enrollment = await Enrollment.create({
          _id: crypto.randomUUID(),
          userId: member._id,
          packageId: activePack._id,
          startDate: start,
          endDate: end,
          status: 'active'
        });
        newEnrollments += 1;

        await Payment.create({
          _id: crypto.randomUUID(),
          userId: member._id,
          enrollmentId: enrollment._id,
          amount: activePack.price,
          method: pick(['card', 'cash', 'transfer']),
          paidAt: start
        });
        newPayments += 1;
      }
    }
  }

  // ---- Nisan-Mayıs arası her gün yoklama ----
  let newAttendanceRows = 0;
  for (let day = 0; day < allDates.length; day++) {
    const dayDate = allDates[day];
    for (const trainer of allTrainers) {
      const dailyCount = 1 + (day % 2); // her güne katılım
      for (let i = 0; i < dailyCount; i++) {
        const member = activeMembers[(day + i + allTrainers.indexOf(trainer)) % activeMembers.length];
        const checkIn = new Date(dayDate);
        checkIn.setHours(8 + ((day + i) % 10), ((day + i) % 2) * 30, 0, 0);
        const checkOut = new Date(checkIn.getTime() + rand(30, 120) * 60000);

        await Attendance.create({
          _id: crypto.randomUUID(),
          userId: member._id,
          trainerId: trainer._id,
          date: dayDate,
          checkIn,
          checkOut
        });
        newAttendanceRows += 1;
      }
    }
  }

  console.log(`✅ Yeni antrenörler hazır: ${trainers.length}`);
  console.log(`✅ Yeni üyeler hazır: ${members.length}`);
  console.log(`✅ Toplam üye: ${totalMembers}, aktif üye: ${targetActiveMembers}`);
  console.log(`✅ Yeni ders eklendi: ${newProgramCount}`);
  console.log(`✅ Yeni ders kaydı satırı: ${newProgramMemberRows}`);
  console.log(`✅ Yeni üyelik: ${newEnrollments}`);
  console.log(`✅ Yeni ödeme: ${newPayments}`);
  console.log(`✅ Yeni yoklama: ${newAttendanceRows}`);
  console.log('🎉 Geniş SQL veri üretimi tamamlandı.');

  await sequelize.close();
  process.exit(0);
}

main().catch((err) => {
  console.error('❌ Hata:', err.message);
  process.exit(1);
});

