import React, { useState, useEffect } from 'react';
import axios from 'axios';

function NurseDashboard() {
  const [shifts, setShifts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [leaveRequest, setLeaveRequest] = useState({
    shiftId: '',
    reason: '',
  });
  const [leaveMessage, setLeaveMessage] = useState('');

  const fetchShifts = async () => {
    try {
      const response = await axios.get(`${process.env.REACT_APP_API_URL}/shifts/my-shifts`);
      setShifts(response.data);
    } catch (err) {
      console.error('Error fetching shifts:', err);
      setError('Failed to fetch shifts.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchShifts();
  }, []);


  const handleLeaveRequestChange = (e) => {
    setLeaveRequest({ ...leaveRequest, [e.target.name]: e.target.value });
  };

  const handleLeaveRequestSubmit = async (e) => {
    e.preventDefault();
    setLeaveMessage('');
    try {
      await axios.post(`${process.env.REACT_APP_API_URL}/leave-requests/request`, leaveRequest);
      setLeaveMessage('Leave request submitted successfully!');
      setLeaveRequest({ shiftId: '', reason: '' }); // Clear form
      fetchShifts(); // Refetch shifts to update UI after leave request
    } catch (err) {
      console.error('Error submitting leave request:', err);
      setLeaveMessage(err.response?.data?.message || 'Failed to submit leave request.');
    }
  };

  const formatTime = (timeString) => {
    if (!timeString) return 'N/A';
    const parts = timeString.split(':');
    if (parts.length < 2) return 'N/A'; // Ensure at least hour and minute parts exist

    const hour = parseInt(parts[0], 10);
    const minute = parseInt(parts[1], 10);

    if (isNaN(hour) || isNaN(minute)) return 'N/A'; // Check if parsed values are numbers

    const date = new Date();
    date.setHours(hour, minute);
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  if (loading) {
    return <div className="nurse-dashboard-container">Loading shifts...</div>;
  }

  if (error) {
    return <div className="nurse-dashboard-container error-message">{error}</div>;
  }

  return (
    <div className="nurse-dashboard-container">
      <h2>Nurse Dashboard</h2>

      <h3>My Shift Schedule</h3>
      {shifts.length === 0 ? (
        <p>No shifts assigned yet.</p>
      ) : (
        <table>
          <thead>
            <tr>
              <th>Date</th>
              <th>Start Time</th>
              <th>End Time</th>
              <th>Ward</th>
              <th>Status</th>
            </tr>
          </thead>
          <tbody>
            {shifts.map((shift) => (
              <tr key={shift._id}>
                <td>{new Date(shift.date).toLocaleDateString()}</td>
                <td>{formatTime(shift.start_time)}</td>
                <td>{formatTime(shift.end_time)}</td>
                <td>{shift.ward}</td>
                <td>{shift.leaveStatus || 'Assigned'}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}

      <h3>Request Leave</h3>
      <form onSubmit={handleLeaveRequestSubmit}>
        <div className="form-group">
          <label htmlFor="shiftId">Select Shift:</label>
          <select
            id="shiftId"
            name="shiftId"
            value={leaveRequest.shiftId}
            onChange={handleLeaveRequestChange}
            required
          >
            <option value="">--Select a shift--</option>
            {shifts.map((shift) => (
              <option key={shift._id} value={shift._id}>
                {new Date(shift.date).toLocaleDateString()} ({formatTime(shift.startTime)} - {formatTime(shift.endTime)}) - {shift.ward}
              </option>
            ))}
          </select>
        </div>
        <div className="form-group">
          <label htmlFor="reason">Reason for Leave:</label>
          <textarea
            id="reason"
            name="reason"
            value={leaveRequest.reason}
            onChange={handleLeaveRequestChange}
            required
          ></textarea>
        </div>
        <button type="submit">Submit Leave Request</button>
        {leaveMessage && <p className={leaveMessage.includes('successfully') ? 'success-message' : 'error-message'}>{leaveMessage}</p>}
      </form>
    </div>
  );
}

export default NurseDashboard;
