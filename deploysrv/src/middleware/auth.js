const pool = require('../db/connection');
const bcrypt = require('bcryptjs');

const basicAuth = async (req, res, next) => { //Gets auth-headr form req
  const authHeader = req.headers['authorization'];

  if (!authHeader || !authHeader.startsWith('Basic ')) { // Return 402 if header is missiong or by lack of basic auth
    return res.status(401).json({ error: 'Authentication required' })
  }

  const base64 = authHeader.split(' ')[1]; //decodes base64 string to username & password
  const [login, password] = Buffer.from(base64, 'base64').toString().split(':')

  try {
    const [rows] = await pool.query('SELECT * FROM users WHERE login = ?', [login])
    if (rows.length === 0) {
      return res.status(401).json({ error: 'Invalid credentials' })
    }

    //Compares password with hased password in DB
    const validPassword = await bcrypt.compare(password, rows[0].password);
    if (!validPassword) {
      return res.status(401).json({ error: 'Invalid credentials' })
    }

    next();
  } catch (err) {
    res.status(500).json({ error: 'Server error' })
  }
};

module.exports = basicAuth;