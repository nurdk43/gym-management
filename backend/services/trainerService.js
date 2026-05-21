const { Op } = require('sequelize');
const { User, Program, Attendance } = require('../db/models');

function gunAraligi(isoTarih) {
  const d = isoTarih ? new Date(isoTarih) : new Date();
  const baslangic = new Date(d); baslangic.setHours(0, 0, 0, 0);
  const bitis = new Date(d); bitis.setHours(23, 59, 59, 999);
  return { baslangic, bitis };
}

async function programOlustur(trainerId, veri) {
  return await Program.create({ ...veri, trainerId });
}

async function programlariGetir(trainerId) {
  return await Program.findAll({
    where: { trainerId },
    include: [{ model: User, as: 'enrolledMembers', attributes: ['_id', 'name', 'email'], through: { attributes: [] } }],
    order: [['createdAt', 'DESC']]
  });
}

async function programGuncelle(trainerId, programId, veri) {
  const program = await Program.findOne({ where: { _id: programId, trainerId } });
  if (!program) {
    const err = new Error('Program bulunamadı');
    err.statusCode = 404;
    throw err;
  }
  await program.update(veri);
  return program;
}

async function programSil(trainerId, programId) {
  const program = await Program.findOne({ where: { _id: programId, trainerId } });
  if (!program) {
    const err = new Error('Program bulunamadı');
    err.statusCode = 404;
    throw err;
  }
  await program.destroy();
}

async function checkinOlustur(trainerId, userId) {
  return await Attendance.create({ trainerId, userId });
}

async function checkoutYap(id) {
  const kayit = await Attendance.findByPk(id);
  if (!kayit) {
    const err = new Error('Kayıt bulunamadı');
    err.statusCode = 404;
    throw err;
  }
  await kayit.update({ checkOut: new Date() });
  return kayit;
}

async function attendanceListe(trainerId, isoTarih) {
  const { baslangic, bitis } = gunAraligi(isoTarih);
  return await Attendance.findAll({
    where: { trainerId, date: { [Op.gte]: baslangic, [Op.lte]: bitis } },
    include: [{ model: User, as: 'user', attributes: ['_id', 'name', 'email', 'phone'] }],
    order: [['checkIn', 'DESC']]
  });
}

async function aktifUyeleriGetir() {
  return await User.findAll({
    where: { role: 'member', isActive: true },
    attributes: ['_id', 'name', 'email', 'role', 'phone', 'isActive', 'createdAt', 'updatedAt'],
    order: [['createdAt', 'DESC']]
  });
}

async function trainerStats(trainerId) {
  const totalPrograms = await Program.count({ where: { trainerId } });
  const activePrograms = await Program.count({ where: { trainerId, isActive: true } });

  const { baslangic, bitis } = gunAraligi();
  const todayAttendance = await Attendance.count({
    where: { trainerId, date: { [Op.gte]: baslangic, [Op.lte]: bitis } }
  });

  const totalMembers = await User.count({ where: { role: 'member', isActive: true } });

  return { totalPrograms, activePrograms, todayAttendance, totalMembers };
}

module.exports = {
  programOlustur,
  programlariGetir,
  programGuncelle,
  programSil,
  checkinOlustur,
  checkoutYap,
  attendanceListe,
  aktifUyeleriGetir,
  trainerStats
};

