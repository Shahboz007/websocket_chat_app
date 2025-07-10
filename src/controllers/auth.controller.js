import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import db from '../models/index.js';

const { User, CallCenterMember } = db;

export const register = async (req, res) => {
    const { username, password, role } = req.body;
    if (!username || !password || !role) {
        return res.status(400).json({ message: "Username, password, and role are required." });
    }
    try {
        const hashedPassword = await bcrypt.hash(password, 10);
        let newUser;
        if (role === 'user') {
            newUser = await User.create({ username, password: hashedPassword });
        } else if (role === 'callcenter') {
            newUser = await CallCenterMember.create({ username, password: hashedPassword });
        } else {
            return res.status(400).json({ message: "Invalid role specified." });
        }
        res.status(201).json({ message: `${role} registered successfully.`, user: { id: newUser.id, username: newUser.username } });
    } catch (error) {
        res.status(500).json({ message: "Registration failed.", error: error.message });
    }
};

export const loginUser = async (req, res) => {
    const { username, password } = req.body;
    try {
        const user = await User.findOne({ where: { username } });
        if (!user || !(await bcrypt.compare(password, user.password))) {
            return res.status(401).json({ message: "Invalid credentials" });
        }
        const token = jwt.sign(
            { id: user.id, username: user.username, role: 'user' },
            process.env.JWT_SECRET,
            { expiresIn: '1h' }
        );
        res.json({ token });
    } catch (error) {
        res.status(500).json({ message: "Server error during login." });
    }
};

export const loginCallCenterMember = async (req, res) => {
    const { username, password } = req.body;
    try {
        const member = await CallCenterMember.findOne({ where: { username } });
        if (!member || !(await bcrypt.compare(password, member.password))) {
            return res.status(401).json({ message: "Invalid credentials" });
        }
        const token = jwt.sign(
            { id: member.id, username: member.username, role: 'callcenter' },
            process.env.JWT_SECRET,
            { expiresIn: '8h' }
        );
        res.json({ token });
    } catch (error) {
        res.status(500).json({ message: "Server error during login." });
    }
};