import React, { useState, useEffect } from 'react';
import axios from 'axios';

axios.defaults.withCredentials = true; // Ensure cookies are sent with requests

function HeadNurseDashboard() {
  const [nurses, setNurses] = useState([]);
  const [shifts, setShifts] = useState([]); // To display all shifts, or just unassigned ones
  const [pendingLeaves, setPendingLeaves] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const [newShift, setNewShift] = useState({
    date: '',
    startTime: '',
    endTime: '',
    ward: '',
  });
  const [assignShift, setAssignShift] = useState({
    shiftId: '',
    nurseId: '',
  });
  const [message, setMessage] = useState('');

  const fetchAllData = async () => {
    try {
      // Fetch nurses
      const nursesResponse = await axios.get(`${process.env.REACT_APP_API_URL}/auth/users/nurses`);
      setNurses(nursesResponse.data);

      // Fetch all shifts (or unassigned shifts, depending on API)

      const shiftsResponse = await axios.get(`${process.env.REACT_APP_API_URL}/shifts/`);
      setShifts(shiftsResponse.data);

      const leavesResponse = await axios.get(`${process.env.REACT_APP_API_URL}/leave-requests/pending`);
      setPendingLeaves(leavesResponse.data);


    } catch (err) {
      console.error('Error fetching data:', err);
      setError('Failed to fetch initial data.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAllData();
  }, []);


  const handleNewShiftChange = (e) => {
    setNewShift({ ...newShift, [e.target.name]: e.target.value });
  };

  const handleCreateShift = async (e) => {
    e.preventDefault();
    setMessage('');
    try {
      await axios.post(`${process.env.REACT_APP_API_URL}/shifts/create`, newShift);
      setMessage('Shift created successfully!');
      setNewShift({ date: '', startTime: '', endTime: '', ward: '' });
      fetchAllData(); // Refresh all data
    } catch (err) {
      console.error('Error creating shift:', err);
      setMessage(err.response?.data?.message || 'Failed to create shift.');
    }
  };

  const handleAssignShiftChange = (e) => {
    setAssignShift({ ...assignShift, [e.target.name]: e.target.value });
  };

  const handleAssignShift = async (e) => {
    e.preventDefault();
    setMessage('');
    try {
      await axios.post(`${process.env.REACT_APP_API_URL}/shifts/assign`, assignShift);
      setMessage('Shift assigned successfully!');
      setAssignShift({ shiftId: '', nurseId: '' });
      fetchAllData(); // Refresh all data
    } catch (err) {
      console.error('Error assigning shift:', err);
      setMessage(err.response?.data?.message || 'Failed to assign shift.');
    }
  };

  const handleLeaveAction = async (leaveId, action) => {
    setMessage('');
    try {
      await axios.post(`${process.env.REACT_APP_API_URL}/leave-requests/${action}/${leaveId}`, {});
      setMessage(`Leave request ${action}d successfully!`);
      fetchAllData(); // Refresh all data
    } catch (err) {
      console.error(`Error ${action}ing leave request:`, err);
      setMessage(err.response?.data?.message || `Failed to ${action} leave request.`);
    }
  };


  const formatTime = (timeString) => {
    if (!timeString) return 'N/A';
    const [hour, minute] = timeString.split(':');
    const date = new Date();
    date.setHours(parseInt(hour, 10), parseInt(minute, 10));
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  if (loading) {
    return <div className="head-nurse-dashboard-container">Loading data...</div>;
  }

  if (error) {
    return <div className="head-nurse-dashboard-container error-message">{error}</div>;
  }

  return (
    <div className="head-nurse-dashboard-container">
      <h2>Head Nurse Dashboard</h2>
      {message && <p className={message.includes('successfully') ? 'success-message' : 'error-message'}>{message}</p>}

      <h3>Create New Shift</h3>
      <form onSubmit={handleCreateShift}>
        <div className="form-group">
          <label htmlFor="shiftDate">Date:</label>
          <input type="date" id="shiftDate" name="date" value={newShift.date} onChange={handleNewShiftChange} required />
        </div>
        <div className="form-group">
          <label htmlFor="startTime">Start Time:</label>
          <input type="time" id="startTime" name="startTime" value={newShift.startTime} onChange={handleNewShiftChange} required />
        </div>
        <div className="form-group">
          <label htmlFor="endTime">End Time:</label>
          <input type="time" id="endTime" name="endTime" value={newShift.endTime} onChange={handleNewShiftChange} required />
        </div>
        <div className="form-group">
          <label htmlFor="ward">Ward:</label>
          <input type="text" id="ward" name="ward" value={newShift.ward} onChange={handleNewShiftChange} required />
        </div>
        <button type="submit">Create Shift</button>
      </form>

      <h3>Assign Shift to Nurse</h3>
      <form onSubmit={handleAssignShift}>
        <div className="form-group">
          <label htmlFor="assignShiftId">Select Shift:</label>
          <select id="assignShiftId" name="shiftId" value={assignShift.shiftId} onChange={handleAssignShiftChange} required>
            <option key="select-shift-default" value="">--Select a shift--</option>
            {shifts.map((shift) => (
              <option key={shift._id} value={shift._id}>
                {new Date(shift.date).toLocaleDateString()} ({formatTime(shift.start_time)} - {formatTime(shift.end_time)}) - {shift.ward}
              </option>
            ))}
          </select>
        </div>
        <div className="form-group">
          <label htmlFor="assignNurseId">Select Nurse:</label>
          <select id="assignNurseId" name="nurseId" value={assignShift.nurseId} onChange={handleAssignShiftChange} required>
            <option key="select-nurse-default-nurse" value="">--Select a nurse--</option>
            {nurses.map((nurse) => (
              <option key={nurse._id} value={nurse._id}>
                {nurse.email} ({nurse.role})
              </option>
            ))}
          </select>
        </div>
        <button type="submit">Assign Shift</button>
      </form>

      <h3>All Shifts</h3>
      {shifts.length === 0 ? (
        <p>No shifts created yet.</p>
      ) : (
        <table>
          <thead>
            <tr>
              <th>Date</th>
              <th>Start Time</th>
              <th>End Time</th>
              <th>Ward</th>
              <th>Assigned Nurse</th>
            </tr>
          </thead>
          <tbody>
            {shifts.map((shift) => (
              <tr key={shift._id}>
                <td>{new Date(shift.date).toLocaleDateString()}</td>
                <td>{formatTime(shift.start_time)}</td>
                <td>{formatTime(shift.end_time)}</td>
                <td>{shift.ward}</td>
                <td>{shift.assignedTo?.email || 'Unassigned'}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}

      <h3>Pending Leave Requests</h3>
      {pendingLeaves.length === 0 ? (
        <p>No pending leave requests.</p>
      ) : (
        <table>
          <thead>
            <tr>
              <th>Nurse Email</th>
              <th>Shift Date</th>
              <th>Shift Time</th>
              <th>Reason</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {pendingLeaves.map((leave) => (
              <tr key={leave._id}>
                <td>{leave.nurseEmail || 'N/A'}</td>
                <td>{new Date(leave.shiftDate).toLocaleDateString() || 'N/A'}</td>
                <td>{formatTime(leave.shiftStartTime) || 'N/A'} - {formatTime(leave.shiftEndTime) || 'N/A'}</td>
                <td>{leave.reason}</td>
                <td>
                  <button onClick={() => handleLeaveAction(leave._id, 'approve')}>Approve</button>
                  <button onClick={() => handleLeaveAction(leave._id, 'reject')}>Reject</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}

export default HeadNurseDashboard;