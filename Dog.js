const mongoose = require('mongoose');

const dogSchema = new mongoose.Schema({
  name: { type: String, required: true },
  description: String,
  status: { type: String, enum: ['available', 'adopted'], default: 'available' },
  registeredBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  adoptedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  thankYouMessage: String
}, { timestamps: true });

module.exports = mongoose.model('Dog', dogSchema);
