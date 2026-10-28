const db = require('../config/db');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

exports.register = async (req, res) => {
    const { business_name, email, password, role } = req.body;

    if (!email || !password) {
        return res.status(400).json({ success: false, message: 'Ju lutem plotësoni email-in dhe fjalëkalimin!' });
    }

    try {
        const [existingUser] = await db.query('SELECT id FROM users WHERE email = ?', [email]);
        if (existingUser.length > 0) {
            return res.status(400).json({ success: false, message: 'Ky email është i regjistruar tashmë!' });
        }

        let businessId = 1;
        if (business_name) {
            const [businessResult] = await db.query('INSERT INTO businesses (name) VALUES (?)', [business_name]);
            businessId = businessResult.insertId;
        }

        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        const userRole = role || 'pronar';
        await db.query(
            'INSERT INTO users (business_id, email, password_hash, role) VALUES (?, ?, ?, ?)',
            [businessId, email, hashedPassword, userRole]
        );

        res.status(201).json({ success: true, message: 'Përdoruesi u regjistrua me sukses!' });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Gabim në server!', error: error.message });
    }
};

exports.login = async (req, res) => {
    const { email, password } = req.body;

    if (!email || !password) {
        return res.status(400).json({ success: false, message: 'Plotësoni email-in dhe fjalëkalimin!' });
    }

    try {
        const [users] = await db.query('SELECT * FROM users WHERE email = ?', [email]);
        if (users.length === 0) {
            return res.status(400).json({ success: false, message: 'Kredencialet janë të pasakta!' });
        }

        const user = users[0];

        const isMatch = await bcrypt.compare(password, user.password_hash);
        if (!isMatch) {
            return res.status(400).json({ success: false, message: 'Kredencialet janë të pasakta!' });
        }
        
        const token = jwt.sign(
            { id: user.id, business_id: user.business_id, role: user.role },
            process.env.JWT_SECRET,
            { expiresIn: '8h' }
        );

        res.json({
            success: true,
            message: 'Kyçja u krye me sukses!',
            token,
            user: {
                id: user.id,
                email: user.email,
                role: user.role,
                business_id: user.business_id
            }
        });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Gabim në server!', error: error.message });
    }
};