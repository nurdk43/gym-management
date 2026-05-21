const asyncHandler = require('../utils/asyncHandler');
const adminService = require('../services/adminService');

const usersGet = asyncHandler(async (req, res) => {
  const { role, search } = req.query;
  const liste = await adminService.kullanicilariGetir({ role, search });
  res.json(liste);
});

const userPut = asyncHandler(async (req, res) => {
  const sonuc = await adminService.kullaniciGuncelle(req.params.id, req.body);
  res.json(sonuc);
});

const userDelete = asyncHandler(async (req, res) => {
  await adminService.kullaniciSil(req.params.id);
  res.json({ message: 'Kullanıcı silindi' });
});

const packagesGet = asyncHandler(async (req, res) => {
  const liste = await adminService.paketleriGetir();
  res.json(liste);
});

const packagePost = asyncHandler(async (req, res) => {
  const paket = await adminService.paketOlustur(req.body);
  res.status(201).json(paket);
});

const packagePut = asyncHandler(async (req, res) => {
  const paket = await adminService.paketGuncelle(req.params.id, req.body);
  res.json(paket);
});

const packageDelete = asyncHandler(async (req, res) => {
  await adminService.paketSil(req.params.id);
  res.json({ message: 'Paket silindi' });
});

const revenueReportGet = asyncHandler(async (req, res) => {
  const { startDate, endDate, limit } = req.query;
  const sonuc = await adminService.gelirRaporu({ startDate, endDate, limit });
  res.json(sonuc);
});

const attendanceReportGet = asyncHandler(async (req, res) => {
  const { startDate, endDate, limit } = req.query;
  const sonuc = await adminService.devamRaporu({ startDate, endDate, limit });
  res.json(sonuc);
});

const statsGet = asyncHandler(async (req, res) => {
  const sonuc = await adminService.adminStats();
  res.json(sonuc);
});

module.exports = {
  usersGet,
  userPut,
  userDelete,
  packagesGet,
  packagePost,
  packagePut,
  packageDelete,
  revenueReportGet,
  attendanceReportGet,
  statsGet
};

