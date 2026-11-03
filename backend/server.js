require('dotenv').config();

const required = ['DB_NAME', 'JWT_SECRET'];
const missing = required.filter((k) => !process.env[k]);
if (missing.length) {
  console.error(`Mungojnë variablat në .env: ${missing.join(', ')}`);
  process.exit(1);
}
if (process.env.JWT_SECRET.length < 16) {
  console.error('JWT_SECRET duhet të ketë të paktën 16 karaktere.');
  process.exit(1);
}

const app = require('./app');
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Serveri po punon në http://localhost:${PORT}`));
