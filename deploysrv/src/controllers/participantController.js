const pool = require('../db/connection')

// Helper functions for input validation
const isValidEmail = (email) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)
const isValidDate = (dob) => /^\d{4}-\d{2}-\d{2}$/.test(dob)

// POST /participants/add - Add a new participant with work and home details
exports.addParticipant = async (req, res) => {
  const { email, firstname, lastname, dob, companyname, salary, currency, country, city } = req.body;

  // Check all fields are present in request body
  if (!email || !firstname || !lastname || !dob || !companyname || !salary || !currency || !country || !city) {
    return res.status(400).json({ error: 'All fields are required' })
  }
  // Validate email format
  if (!isValidEmail(email)) {
    return res.status(400).json({ error: 'Invalid email format' });
  }
  // Validate date
  if (!isValidDate(dob)) {
    return res.status(400).json({error: 'Invalid date format, use YYYY-MM-DD'});
  }

  try { // Insert into all three tables
    await pool.query(
      'INSERT INTO participants (email, firstname, lastname, dob) VALUES (?, ?, ?, ?)',
      [email, firstname, lastname, dob]
    )

    await pool.query(
      'INSERT INTO work (participant_email, companyname, salary, currency) VALUES (?, ?, ?, ?)',
      [email, companyname, salary, currency]
    )

    await pool.query(
      'INSERT INTO home (participant_email, country, city) VALUES (?, ?, ?)',
      [email, country, city]
    );

    res.status(201).json({ message: 'Participant added successfully' })
  } catch (err) {
    // Handle duplicate email
    if (err.code === 'ER_DUP_ENTRY') {
      return res.status(409).json({ error: 'Participant with this email already exists' });
    }
    res.status(500).json({ error: 'Server error' })
  }
};

// GET /participants - Return all participants (email, firstname, lastname)
exports.getParticipants = async (req, res) => {
  try {
    // Filter out soft-deleted participants
    const [rows] = await pool.query(
      'SELECT email, firstname, lastname FROM participants WHERE deleted_at IS NULL'
    )

    res.status(200).json(rows);
  } catch (err) {res.status(500).json({ error: 'Server error' })
  }
};

// GET /participants/details - Return personal details for all participants
exports.getDetails = async (req, res) => {
  try {
    // Filter out soft-deleted participants
    const [rows] = await pool.query(
      'SELECT email, firstname, lastname FROM participants WHERE deleted_at IS NULL'
    )
    res.status(200).json(rows)
  } catch (err) {res.status(500).json({error: 'Server error'})
  }
};

// GET /participants/details/:email - Return personal details for a single participant
exports.getDetailsByEmail = async (req, res) => {
  const { email } = req.params;
  try {
    const [rows] = await pool.query(
      'SELECT firstname, lastname, dob FROM participants WHERE email = ? AND deleted_at IS NULL',
      [email]
    );
    // Return 404 if participant does not exist or is deleted
    if (rows.length === 0) {
      return res.status(404).json({ error: 'Participant not found' })
    }
    res.status(200).json(rows[0]);
  } catch (err) {res.status(500).json({ error: 'Server error' })
  }
};

// GET /participants/work/:email - Return work details for a single participant
exports.getWorkByEmail = async (req, res) => {
  const { email } = req.params;
  try {
    // Join with participants to respect soft delete
    const [rows] = await pool.query(
      'SELECT w.companyname, w.salary, w.currency FROM work w JOIN participants p ON w.participant_email = p.email WHERE w.participant_email = ? AND p.deleted_at IS NULL',
      [email]
    );
    if (rows.length === 0) {
      return res.status(404).json({ error: 'Participant not found' })
    }
    res.status(200).json(rows[0])
  } catch (err) {
    res.status(500).json({ error: 'Server error' });
  }
};

// GET /participants/home/:email - Return home details for a single participant
exports.getHomeByEmail = async (req, res) => {
  const { email } = req.params;
  try {
    // Join with participants for soft delete
    const [rows] = await pool.query(
      'SELECT h.country, h.city FROM home h JOIN participants p ON h.participant_email = p.email WHERE h.participant_email = ? AND p.deleted_at IS NULL',
      [email]
    );
    if (rows.length === 0) {
      return res.status(404).json({ error: 'Participant not found' })
    }
    res.status(200).json(rows[0])
  } catch (err) {
    res.status(500).json({ error: 'Server error' });
  }
};

// DELETE /participants/:email - Soft delete a participant by setting deleted_at timestamp
exports.deleteParticipant = async (req, res) => {
  const { email } = req.params;
  try {
    // Check participant exists and is not already deleted
    const [rows] = await pool.query(
      'SELECT * FROM participants WHERE email = ? AND deleted_at IS NULL',
      [email]
    )
    if (rows.length === 0) {
      return res.status(404).json({ error: 'Participant not found' })
    }
    // Set deleted_at instead of removing the record permanently
    await pool.query(
      'UPDATE participants SET deleted_at = NOW() WHERE email = ?',
      [email]
    )

    res.status(200).json({ message: 'Participant deleted successfully' })
  } catch (err) {res.status(500).json({ error: 'Server error' })
  }
};

// PUT /participants/:email - Update all fields for an existing participant
exports.updateParticipant = async (req, res) => {
  const { email } = req.params;
  const { firstname, lastname, dob, companyname, salary, currency, country, city } = req.body;

  // Check all fields are present in request body
  if (!firstname || !lastname || !dob || !companyname || !salary || !currency || !country || !city) {
    return res.status(400).json({error: 'All fields are required'})

  }// Validate date format
  if (!isValidDate(dob)) {return res.status(400).json({error: 'Invalid date format, use YYYY-MM-DD'})
  }

  try {// Check participant exists and is not deleted
    const [rows] = await pool.query(
      'SELECT * FROM participants WHERE email = ? AND deleted_at IS NULL',
      [email]
    )
    if (rows.length === 0) {
      return res.status(404).json({ error: 'Participant not found' })
    }

    // Update all 3 tables
    await pool.query(
      'UPDATE participants SET firstname = ?, lastname = ?, dob = ? WHERE email = ?',
      [firstname, lastname, dob, email]
    )
    await pool.query(
      'UPDATE work SET companyname = ?, salary = ?, currency = ? WHERE participant_email = ?',
      [companyname, salary, currency, email]
    )
    await pool.query(
      'UPDATE home SET country = ?, city = ? WHERE participant_email = ?',
      [country, city, email]
    );

    res.status(200).json({ message: 'Participant updated successfully' })
  } catch (err) {res.status(500).json({ error: 'Server error' })
  }
};