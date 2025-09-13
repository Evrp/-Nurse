
const { pool } = require('../models/db');

// @desc    Create a leave request
// @route   POST /leave-requests
// @access  Private (nurse)
exports.createLeaveRequest = async (req, res) => {
    const { shiftId, reason } = req.body;
    const userId = req.user.id;

    if (!shiftId || !reason) {
        return res.status(400).json({ message: 'Please provide shiftId and reason.' });
    }

    try {
        // Find the shift_assignment_id for the given shiftId and user_id
        const [assignment] = await pool.query(
            'SELECT id FROM shift_assignments WHERE shift_id = ? AND user_id = ?',
            [shiftId, userId]
        );

        if (assignment.length === 0) {
            return res.status(404).json({ message: 'Shift assignment not found for this user and shift.' });
        }

        const shiftAssignmentId = assignment[0].id;

        // Check if a leave request already exists for this assignment
        const [existingLeave] = await pool.query(
            'SELECT * FROM leave_requests WHERE shift_assignment_id = ?',
            [shiftAssignmentId]
        );

        if (existingLeave.length > 0) {
            return res.status(409).json({ message: 'Leave request already exists for this shift.' });
        }

        const [result] = await pool.query(
            'INSERT INTO leave_requests (shift_assignment_id, reason, status) VALUES (?, ?, ?)',
            [shiftAssignmentId, reason, 'pending']
        );
        res.status(201).json({ message: 'Leave request submitted successfully', leaveRequestId: result.insertId });
    } catch (error) {
        console.error('Error submitting leave request:', error);
        res.status(500).json({ message: 'Error submitting leave request', error });
    }
};

// @desc    Get all leave requests (for head nurse)
// @route   GET /leave-requests
// @access  Private (head_nurse)
exports.getLeaveRequests = async (req, res) => {
    try {
        const [requests] = await pool.query(
            `SELECT lr.id AS _id, lr.reason, lr.status, lr.approved_by, 
                    u.email AS nurseEmail, u.name AS nurseName,
                    s.id AS shiftId, s.date AS shiftDate, s.start_time AS shiftStartTime, s.end_time AS shiftEndTime, s.ward AS shiftWard
             FROM leave_requests lr
             JOIN shift_assignments sa ON lr.shift_assignment_id = sa.id
             JOIN users u ON sa.user_id = u.id
             JOIN shifts s ON sa.shift_id = s.id
             ORDER BY lr.status, s.date`
        );
        res.json(requests);
    } catch (error) {
        console.error('Error fetching leave requests:', error);
        res.status(500).json({ message: 'Error fetching leave requests', error });
    }
};

// @desc    Get pending leave requests (for head nurse)
// @route   GET /leave-requests/pending
// @access  Private (head_nurse)
exports.getPendingLeaveRequests = async (req, res) => {
    try {
        const [requests] = await pool.query(
            `SELECT lr.id AS _id, lr.reason, lr.status, lr.approved_by, 
                    u.email AS nurseEmail, u.name AS nurseName,
                    s.id AS shiftId, s.date AS shiftDate, s.start_time AS shiftStartTime, s.end_time AS shiftEndTime, s.ward AS shiftWard
             FROM leave_requests lr
             JOIN shift_assignments sa ON lr.shift_assignment_id = sa.id
             JOIN users u ON sa.user_id = u.id
             JOIN shifts s ON sa.shift_id = s.id
             WHERE lr.status = 'pending'
             ORDER BY s.date`
        );
        res.json(requests);
    } catch (error) {
        console.error('Error fetching pending leave requests:', error);
        res.status(500).json({ message: 'Error fetching pending leave requests' });
    }
};

// Helper function to update leave request status
const updateLeaveRequestStatus = async (leaveId, status, approvedBy, res) => {
    try {
        const [result] = await pool.query('UPDATE leave_requests SET status = ?, approved_by = ? WHERE id = ?', [status, approvedBy, leaveId]);

        if (result.affectedRows === 0) {
            return res.status(404).json({ message: 'Leave request not found.' });
        }

        res.json({ message: `Leave request ${status} successfully` });
    } catch (error) {
        console.error(`Error ${status}ing leave request:`, error);
        res.status(500).json({ message: `Error ${status}ing leave request` });
    }
};

// @desc    Approve a leave request
// @route   POST /leave-requests/approve/:id
// @access  Private (head_nurse)
exports.approveLeaveRequest = async (req, res) => {
    const { id } = req.params;
    await updateLeaveRequestStatus(id, 'approved', req.user.id, res);
};

// @desc    Reject a leave request
// @route   POST /leave-requests/reject/:id
// @access  Private (head_nurse)
exports.rejectLeaveRequest = async (req, res) => {
    const { id } = req.params;
    await updateLeaveRequestStatus(id, 'rejected', req.user.id, res);
};
