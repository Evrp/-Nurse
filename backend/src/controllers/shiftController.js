
const { pool } = require('../models/db');

// @desc    Create a new shift
// @route   POST /shifts
// @access  Private (head_nurse)
exports.createShift = async (req, res) => {
    const { date, startTime, endTime, ward } = req.body;

    if (!date || !startTime || !endTime || !ward) {
        return res.status(400).json({ message: 'Please provide date, startTime, endTime, and ward.' });
    }

    try {
        const [result] = await pool.query('INSERT INTO shifts (date, start_time, end_time, ward) VALUES (?, ?, ?, ?)', [date, startTime, endTime, ward]);
        res.status(201).json({ message: 'Shift created successfully', shiftId: result.insertId });
    } catch (error) {
        res.status(500).json({ message: 'Error creating shift', error });
    }
};

// @desc    Assign a nurse to a shift
// @route   POST /shifts/assign
// @access  Private (head_nurse)
exports.assignShift = async (req, res) => {
    const { shiftId, nurseId } = req.body;

    if (!shiftId || !nurseId) {
        return res.status(400).json({ message: 'Please provide shiftId and nurseId.' });
    }

    try {
        // Extract email from nurseId string
        const nurseEmailMatch = nurseId.match(/^([^\s]+)@([^\s]+)\s*\(nurse\)$/);
        let actualNurseId = nurseId; // Default to original if not in expected format

        if (nurseEmailMatch && nurseEmailMatch[1] && nurseEmailMatch[2]) {
            const nurseEmail = `${nurseEmailMatch[1]}@${nurseEmailMatch[2]}`;
            const [nurseRows] = await pool.query('SELECT id FROM users WHERE email = ? AND role = "nurse" LIMIT 1', [nurseEmail]);
            if (nurseRows.length > 0) {
                actualNurseId = nurseRows[0].id;
            } else {
                return res.status(404).json({ message: 'Nurse not found with provided email.' });
            }
        }

        // Check if user and shift exist
        const [rows] = await pool.query(
            'SELECT * FROM users WHERE id = ? AND role = "nurse"',
            [actualNurseId]
        );

        const [user] = rows;
        if (user.length === 0) {
            return res.status(404).json({ message: 'Nurse not found.' });
        }
        const [shift] = await pool.query('SELECT * FROM shifts WHERE id = ?', [shiftId]);
        if (shift.length === 0) {
            return res.status(404).json({ message: 'Shift not found.' });
        }

        // Check if shift is already assigned
        const [existingAssignment] = await pool.query('SELECT * FROM shift_assignments WHERE shift_id = ?', [shiftId]);
        if (existingAssignment.length > 0) {
            return res.status(409).json({ message: 'Shift is already assigned.' });
        }

        const [result] = await pool.query('INSERT INTO shift_assignments (shift_id, user_id) VALUES (?, ?)', [shiftId, actualNurseId]);
        res.status(201).json({ message: 'Shift assigned successfully', assignmentId: result.insertId });
    } catch (error) {
        console.error('Error assigning shift:', error);
        res.status(500).json({ message: 'Error assigning shift', error });
    }
};

// @desc    Get all shifts (for head nurse)
// @route   GET /shifts
// @access  Private (head_nurse)
exports.getAllShifts = async (req, res) => {
    try {
        const [shifts] = await pool.query(
            `SELECT s.id AS _id, s.date, s.start_time, s.end_time, s.ward, u.id AS assignedToId, u.email AS assignedToEmail
             FROM shifts s
             LEFT JOIN shift_assignments sa ON s.id = sa.shift_id
             LEFT JOIN users u ON sa.user_id = u.id
             ORDER BY s.date, s.start_time`
        );
        res.json(shifts);
    } catch (error) {
        console.error('Error fetching all shifts:', error);
        res.status(500).json({ message: 'Error fetching all shifts' });
    }
};

// @desc    Get my schedule
// @route   GET /shifts/my-shifts
// @access  Private (nurse)
exports.getMySchedule = async (req, res) => {
    // console.log(req.user);
    try {
        const [schedule] = await pool.query(
            `SELECT s.id AS _id, s.date, s.start_time, s.end_time, s.ward, lr.status AS leaveStatus
             FROM shift_assignments sa
             JOIN shifts s ON sa.shift_id = s.id
             LEFT JOIN leave_requests lr ON sa.id = lr.shift_assignment_id
             WHERE sa.user_id = ?
             ORDER BY s.date, s.start_time`,
            [req.user.id]
        );
        // console.log('Schedule data:', schedule);
        res.json(schedule);
    } catch (error) {
        console.error('Error fetching schedule:', error);
        res.status(500).json({ message: 'Error fetching schedule', error });
    }
};

