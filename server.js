require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');

const app = express();

app.use(cors({ origin: '*', credentials: true }));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

try {
  const fileUpload = require('express-fileupload');
  app.use(fileUpload({ useTempFiles: true, tempFileDir: '/tmp/' }));
} catch(e) {}

try {
  const cloudinary = require('cloudinary').v2;
  cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME || '',
    api_key: process.env.CLOUDINARY_API_KEY || '',
    api_secret: process.env.CLOUDINARY_API_SECRET || ''
  });
} catch(e) {}

app.use('/api/auth', require('./routes/auth'));
app.use('/api/records', require('./routes/records'));
app.use('/api/notify', require('./routes/notifications'));
app.get('/api/health', (req, res) => res.json({ status: 'ok' }));
app.get('/', (req, res) => res.json({ message: 'API Running' }));

async function connectDB() {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ MongoDB connected');
    const User = require('./models/User');
    const adminExists = await User.findOne({ username: 'admin' });
    if (!adminExists) {
      await User.create({ username: 'admin', password: 'Admin@1234', name: 'مدير النظام', role: 'admin' });
      await User.create({ username: 'user', password: 'User@1234', name: 'مستخدم النظام', role: 'user' });
    }
  } catch (err) {
    console.error('❌ Error:', err.message);
    process.exit(1);
  }
}

connectDB();
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`🚀 Port ${PORT}`));
