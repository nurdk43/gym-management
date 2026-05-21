const { fn, col } = require('sequelize');
const crypto = require('crypto');
const { User, Package, Enrollment, Payment, Program, ProgramMember } = require('../db/models');

async function aktifPaketleriGetir() {
  return await Package.findAll({ where: { isActive: true }, order: [['price', 'ASC']] });
}

async function paketSatinAl(memberId, { packageId, method }) {
  const paket = await Package.findByPk(packageId);
  if (!paket) {
    const err = new Error('Paket bulunamadı');
    err.statusCode = 404;
    throw err;
  }
  if (!paket.isActive) {
    const err = new Error('Bu paket artık aktif değil');
    err.statusCode = 400;
    throw err;
  }

  const baslangic = new Date();
  const bitis = new Date();
  bitis.setDate(bitis.getDate() + paket.durationDays);

  const enrollment = await Enrollment.create({
    _id: crypto.randomUUID(),
    userId: memberId,
    packageId,
    startDate: baslangic,
    endDate: bitis,
    status: 'active'
  });

  const payment = await Payment.create({
    _id: crypto.randomUUID(),
    userId: memberId,
    enrollmentId: enrollment._id,
    amount: paket.price,
    method: method || 'card',
    paidAt: new Date()
  });

  return { enrollment, payment };
}

async function uyeliklerim(memberId) {
  return await Enrollment.findAll({
    where: { userId: memberId },
    include: [{ model: Package, as: 'package' }],
    order: [['createdAt', 'DESC']]
  });
}

async function tumAktifDersler() {
  return await Program.findAll({
    where: { isActive: true },
    include: [
      { model: User, as: 'trainer', attributes: ['_id', 'name'] },
      { model: User, as: 'enrolledMembers', attributes: ['_id', 'name'], through: { attributes: [] } }
    ]
  });
}

async function dersKaydol(memberId, { programId }) {
  const ders = await Program.findByPk(programId);
  if (!ders) {
    const err = new Error('Ders bulunamadı');
    err.statusCode = 404;
    throw err;
  }
  if (!ders.isActive) {
    const err = new Error('Bu ders aktif değil');
    err.statusCode = 400;
    throw err;
  }

  const kayitli = await ProgramMember.findOne({ where: { program: programId, member: memberId } });
  if (kayitli) {
    const err = new Error('Bu derse zaten kayıtlısınız');
    err.statusCode = 400;
    throw err;
  }

  const katilimciSayisi = await ProgramMember.count({ where: { program: programId } });
  if (katilimciSayisi >= (ders.maxCapacity || 0)) {
    const err = new Error('Ders kapasitesi dolu');
    err.statusCode = 400;
    throw err;
  }

  await ProgramMember.create({ program: programId, member: memberId });
  return { message: 'Derse başarıyla kaydoldunuz' };
}

async function derstenCik(memberId, programId) {
  const satir = await ProgramMember.findOne({ where: { program: programId, member: memberId } });
  if (satir) await satir.destroy();
}

async function derslerim(memberId) {
  return await Program.findAll({
    include: [
      { model: User, as: 'trainer', attributes: ['_id', 'name'] },
      {
        model: User,
        as: 'enrolledMembers',
        attributes: [],
        through: { attributes: [] },
        where: { _id: memberId }
      }
    ]
  });
}

async function odemelerim(memberId) {
  return await Payment.findAll({
    where: { userId: memberId },
    include: [
      {
        model: Enrollment,
        as: 'enrollment',
        include: [{ model: Package, as: 'package', attributes: ['name', 'durationDays'] }]
      }
    ],
    order: [['paidAt', 'DESC']]
  });
}

async function memberStats(memberId) {
  const activeEnrollments = await Enrollment.count({ where: { userId: memberId, status: 'active' } });
  const myClasses = await ProgramMember.count({ where: { member: memberId } });

  const toplam = await Payment.findOne({
    where: { userId: memberId },
    attributes: [[fn('SUM', col('amount')), 'total']]
  });

  return {
    activeEnrollments,
    myClasses,
    totalSpent: Number(toplam?.get('total') || 0)
  };
}

module.exports = {
  aktifPaketleriGetir,
  paketSatinAl,
  uyeliklerim,
  tumAktifDersler,
  dersKaydol,
  derstenCik,
  derslerim,
  odemelerim,
  memberStats
};

