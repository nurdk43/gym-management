const asyncHandler = require('../utils/asyncHandler');
const trainerService = require('../services/trainerService');

const programsPost = asyncHandler(async (req, res) => {
  const program = await trainerService.programOlustur(req.user._id, req.body);
  res.status(201).json(program);
});

const programsGet = asyncHandler(async (req, res) => {
  const liste = await trainerService.programlariGetir(req.user._id);
  res.json(liste);
});

const programsPut = asyncHandler(async (req, res) => {
  const program = await trainerService.programGuncelle(req.user._id, req.params.id, req.body);
  res.json(program);
});

const programsDelete = asyncHandler(async (req, res) => {
  await trainerService.programSil(req.user._id, req.params.id);
  res.json({ message: 'Program silindi' });
});

const attendancePost = asyncHandler(async (req, res) => {
  const kayit = await trainerService.checkinOlustur(req.user._id, req.body.userId);
  res.status(201).json(kayit);
});

const attendanceCheckoutPut = asyncHandler(async (req, res) => {
  const kayit = await trainerService.checkoutYap(req.params.id);
  res.json(kayit);
});

const attendanceGet = asyncHandler(async (req, res) => {
  const kayitlar = await trainerService.attendanceListe(req.user._id, req.query.date);
  res.json(kayitlar);
});

const membersGet = asyncHandler(async (req, res) => {
  const uyeler = await trainerService.aktifUyeleriGetir();
  res.json(uyeler);
});

const statsGet = asyncHandler(async (req, res) => {
  const sonuc = await trainerService.trainerStats(req.user._id);
  res.json(sonuc);
});

module.exports = {
  programsPost,
  programsGet,
  programsPut,
  programsDelete,
  attendancePost,
  attendanceCheckoutPut,
  attendanceGet,
  membersGet,
  statsGet
};

