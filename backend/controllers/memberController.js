const asyncHandler = require('../utils/asyncHandler');
const memberService = require('../services/memberService');

const packagesGet = asyncHandler(async (req, res) => {
  const liste = await memberService.aktifPaketleriGetir();
  res.json(liste);
});

const enrollPost = asyncHandler(async (req, res) => {
  const sonuc = await memberService.paketSatinAl(req.user._id, req.body);
  res.status(201).json(sonuc);
});

const enrollmentsGet = asyncHandler(async (req, res) => {
  const liste = await memberService.uyeliklerim(req.user._id);
  res.json(liste);
});

const classesGet = asyncHandler(async (req, res) => {
  const liste = await memberService.tumAktifDersler();
  res.json(liste);
});

const classesEnrollPost = asyncHandler(async (req, res) => {
  const sonuc = await memberService.dersKaydol(req.user._id, req.body);
  res.json(sonuc);
});

const classesDelete = asyncHandler(async (req, res) => {
  await memberService.derstenCik(req.user._id, req.params.id);
  res.json({ message: 'Dersten çıkış yapıldı' });
});

const myClassesGet = asyncHandler(async (req, res) => {
  const liste = await memberService.derslerim(req.user._id);
  res.json(liste);
});

const paymentsGet = asyncHandler(async (req, res) => {
  const liste = await memberService.odemelerim(req.user._id);
  res.json(liste);
});

const statsGet = asyncHandler(async (req, res) => {
  const sonuc = await memberService.memberStats(req.user._id);
  res.json(sonuc);
});

module.exports = {
  packagesGet,
  enrollPost,
  enrollmentsGet,
  classesGet,
  classesEnrollPost,
  classesDelete,
  myClassesGet,
  paymentsGet,
  statsGet
};

