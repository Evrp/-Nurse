
const express = require('express');
const cors = require('cors');
const cookieParser = require('cookie-parser');
const authRoutes = require('./src/routes/authRoutes');
const shiftRoutes = require('./src/routes/shiftRoutes');
const leaveRoutes = require('./src/routes/leaveRoutes');
const db = require('./src/models/db');

const app = express();
const port = process.env.PORT || 3000;

app.use(cors({
  origin: process.env.FRONTEND_URL,
  credentials: true,
}));
app.use(express.json());
app.use(cookieParser());

app.use('/auth', authRoutes);
app.use('/shifts', shiftRoutes);
app.use('/leave-requests', leaveRoutes);

app.get('/', (req, res) => {
  res.send('Nurse Scheduling API is running!');
});

// Generic error handler
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).send('Something broke!\n' + err.message);
});

(async () => {
  try {
    await db.sync();
    console.log('Database synchronized successfully.');
    app.listen(port, () => {
      console.log(`Server is running on port ${port}`);
    });
  } catch (error) {
    console.error('Unable to synchronize the database:', error);
  }
})();
