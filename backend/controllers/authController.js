const jwt = require('jsonwebtoken');
const asyncHandler = require('../utils/asyncHandler');
const authService = require('../services/authService');

function tokenOlustur(kullaniciId) {
  return jwt.sign({ id: kullaniciId }, process.env.JWT_SECRET, { expiresIn: '30d' });
}

const me = asyncHandler(async (req, res) => {
  res.json(req.user);
});

const register = asyncHandler(async (req, res) => {
  const { name, email, password, role, phone } = req.body;
  const kullanici = await authService.kayitOl({ name, email, password, role, phone });

  res.status(201).json({
    token: tokenOlustur(kullanici._id),
    user: { id: kullanici._id, name: kullanici.name, email: kullanici.email, role: kullanici.role }
  });
});

const login = asyncHandler(async (req, res) => {
  const { email, password } = req.body;
  const kullanici = await authService.girisYap({ email, password });

  res.json({
    token: tokenOlustur(kullanici._id),
    user: { id: kullanici._id, name: kullanici.name, email: kullanici.email, role: kullanici.role }
  });
});

module.exports = { me, register, login };

