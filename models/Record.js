const mongoose = require('mongoose');

const recordSchema = new mongoose.Schema({
  type: { type: String, enum: ['health', 'iqama'], required: true },
  name: { type: String, required: true, trim: true },
  phone: { type: String, required: true, trim: true },
  certNum: { type: String, required: true, trim: true },
  nationality: { type: String, trim: true },
  issueDate: { type: Date, required: true },
  expiryDate: { type: Date, required: true },
  email: { type: String, trim: true },
  notes: { type: String },
  imageUrl: { type: String },
  imagePublicId: { type: String },
  createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  lastNotified: { type: Date }
}, { timestamps: true });

recordSchema.virtual('status').get(function() {
  const today = new Date();
  const expiry = new Date(this.expiryDate);
  const diffDays = Math.ceil((expiry - today) / (1000 * 60 * 60 * 24));
  if (diffDays < 0) return 'expired';
  if (diffDays <= 30) return 'expiring';
  return 'valid';
});

recordSchema.virtual('daysLeft').get(function() {
  const today = new Date();
  const expiry = new Date(this.expiryDate);
  return Math.ceil((expiry - today) / (1000 * 60 * 60 * 24));
});

recordSchema.set('toJSON', { virtuals: true });
recordSchema.set('toObject', { virtuals: true });

module.exports = mongoose.model('Record', recordSchema);
