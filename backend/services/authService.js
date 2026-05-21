const bcrypt = require('bcryptjs');
const crypto = require('crypto');
const { User } = require('../db/models');

function normalizeEmail(email) {
  return String(email || '').trim().toLowerCase();
}

async function kayitOl({ name, email, password, role, phone }) {
  const mail = normalizeEmail(email);
  const mevcut = await User.findOne({ where: { email: mail } });
  if (mevcut) {
    const err = new Error('Bu e-posta adresi zaten kayıtlı');
    err.statusCode = 400;
    throw err;
  }

  const hash = await bcrypt.hash(String(password), 10);
  const id = crypto.randomUUID();

  const kullanici = await User.create({
    _id: id,
    name,
    email: mail,
    password: hash,
    role: role || 'member',
    phone: phone || null,
    isActive: true
  });

  return kullanici;
}

async function girisYap({ email, password }) {
  const mail = normalizeEmail(email);
  const kullanici = await User.findOne({ where: { email: mail } });
  if (!kullanici) {
    const err = new Error('Geçersiz e-posta veya şifre');
    err.statusCode = 400;
    throw err;
  }

  const gecerli = await bcrypt.compare(String(password), String(kullanici.password));
  if (!gecerli) {
    const err = new Error('Geçersiz e-posta veya şifre');
    err.statusCode = 400;
    throw err;
  }

  return kullanici;
}

module.exports = { kayitOl, girisYap };

