const { Op, fn, col } = require('sequelize');
const { User, Package, Enrollment, Payment, Attendance } = require('../db/models');
const DEFAULT_REPORT_DAYS = 30;
const DEFAULT_REVENUE_LIMIT = 100;
const DEFAULT_ATTENDANCE_LIMIT = 150;

function gunAraligi(isoTarih) {
  const d = isoTarih ? new Date(isoTarih) : new Date();
  const baslangic = new Date(d); baslangic.setHours(0, 0, 0, 0);
  const bitis = new Date(d); bitis.setHours(23, 59, 59, 999);
  return { baslangic, bitis };
}

function tarihFiltresiOlustur(startDate, endDate, alan, varsayilanGun = DEFAULT_REPORT_DAYS) {
  if (startDate || endDate) {
    const filtre = {};
    if (startDate) filtre[Op.gte] = new Date(startDate);
    if (endDate) filtre[Op.lte] = new Date(endDate);
    return { [alan]: filtre };
  }

  const bitis = new Date();
  const baslangic = new Date();
  baslangic.setDate(baslangic.getDate() - varsayilanGun);
  return { [alan]: { [Op.gte]: baslangic, [Op.lte]: bitis } };
}

async function kullanicilariGetir({ role, search }) {
  const where = {};
  if (role) where.role = role;
  if (search) {
    where[Op.or] = [
      { name: { [Op.like]: `%${search}%` } },
      { email: { [Op.like]: `%${String(search).toLowerCase()}%` } }
    ];
  }

  const liste = await User.findAll({
    where,
    attributes: ['_id', 'name', 'email', 'role', 'phone', 'isActive', 'createdAt', 'updatedAt'],
    order: [['createdAt', 'DESC']]
  });
  return liste;
}

async function kullaniciGuncelle(id, { name, email, role, phone, isActive }) {
  const kullanici = await User.findByPk(id);
  if (!kullanici) {
    const err = new Error('Kullanıcı bulunamadı');
    err.statusCode = 404;
    throw err;
  }
  await kullanici.update({
    name,
    email: email ? String(email).toLowerCase() : kullanici.email,
    role,
    phone,
    isActive
  });
  return {
    _id: kullanici._id,
    name: kullanici.name,
    email: kullanici.email,
    role: kullanici.role,
    phone: kullanici.phone,
    isActive: kullanici.isActive,
    createdAt: kullanici.createdAt,
    updatedAt: kullanici.updatedAt
  };
}

async function kullaniciSil(id) {
  const kullanici = await User.findByPk(id);
  if (!kullanici) {
    const err = new Error('Kullanıcı bulunamadı');
    err.statusCode = 404;
    throw err;
  }
  await kullanici.destroy();
}

async function paketleriGetir() {
  return await Package.findAll({ order: [['createdAt', 'DESC']] });
}

async function paketOlustur(veri) {
  return await Package.create(veri);
}

async function paketGuncelle(id, veri) {
  const paket = await Package.findByPk(id);
  if (!paket) {
    const err = new Error('Paket bulunamadı');
    err.statusCode = 404;
    throw err;
  }
  await paket.update(veri);
  return paket;
}

async function paketSil(id) {
  const paket = await Package.findByPk(id);
  if (!paket) {
    const err = new Error('Paket bulunamadı');
    err.statusCode = 404;
    throw err;
  }
  await paket.destroy();
}

async function gelirRaporu({ startDate, endDate, limit }) {
  const where = tarihFiltresiOlustur(startDate, endDate, 'paidAt');
  const kayitLimiti = Number(limit) > 0 ? Math.min(Number(limit), 500) : DEFAULT_REVENUE_LIMIT;

  const odemeler = await Payment.findAll({
    where,
    include: [
      { model: User, as: 'user', attributes: ['_id', 'name', 'email'] },
      {
        model: Enrollment,
        as: 'enrollment',
        include: [{ model: Package, as: 'package', attributes: ['_id', 'name'] }]
      }
    ],
    order: [['paidAt', 'DESC']],
    limit: kayitLimiti
  });

  const toplamGelir = odemeler.reduce((t, o) => t + (o.amount || 0), 0);
  const dagilim = {};
  for (const o of odemeler) {
    const paketAdi = o.enrollment?.package?.name || 'Diğer';
    dagilim[paketAdi] = (dagilim[paketAdi] || 0) + (o.amount || 0);
  }

  return { totalRevenue: toplamGelir, payments: odemeler, count: odemeler.length, distribution: dagilim };
}

async function devamRaporu({ startDate, endDate, limit }) {
  const where = tarihFiltresiOlustur(startDate, endDate, 'date');
  const kayitLimiti = Number(limit) > 0 ? Math.min(Number(limit), 500) : DEFAULT_ATTENDANCE_LIMIT;

  const kayitlar = await Attendance.findAll({
    where,
    include: [
      { model: User, as: 'user', attributes: ['_id', 'name', 'email'] },
      { model: User, as: 'trainer', attributes: ['_id', 'name'] }
    ],
    order: [['date', 'DESC']],
    limit: kayitLimiti
  });

  const dagilim = {};
  for (const k of kayitlar) {
    const ad = k.trainer?.name || 'Diğer';
    dagilim[ad] = (dagilim[ad] || 0) + 1;
  }

  return { attendance: kayitlar, count: kayitlar.length, distribution: dagilim };
}

async function adminStats() {
  const totalMembers = await User.count({ where: { role: 'member' } });
  const totalTrainers = await User.count({ where: { role: 'trainer' } });
  const activeEnrollments = await Enrollment.count({ where: { status: 'active' } });

  const toplamGelir = await Payment.findOne({
    attributes: [[fn('SUM', col('amount')), 'total']]
  });

  const ayBasi = new Date(new Date().getFullYear(), new Date().getMonth(), 1);
  const aylikGelir = await Payment.findOne({
    where: { paidAt: { [Op.gte]: ayBasi } },
    attributes: [[fn('SUM', col('amount')), 'total']]
  });

  return {
    totalMembers,
    totalTrainers,
    activeEnrollments,
    totalRevenue: Number(toplamGelir?.get('total') || 0),
    monthlyRevenue: Number(aylikGelir?.get('total') || 0)
  };
}

module.exports = {
  kullanicilariGetir,
  kullaniciGuncelle,
  kullaniciSil,
  paketleriGetir,
  paketOlustur,
  paketGuncelle,
  paketSil,
  gelirRaporu,
  devamRaporu,
  adminStats,
  gunAraligi
};

