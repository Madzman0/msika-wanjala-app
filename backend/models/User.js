const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  name: { type: String, required: true, trim: true },
  phone: { type: String, required: true, unique: true },
  email: { type: String, unique: true, sparse: true },
  password: { type: String, required: true },
  role: {
    type: String,
    enum: ['buyer', 'seller', 'transporter', 'admin'],
    default: 'buyer'
  },
  approved: { type: Boolean, default: false }, // for seller/transporter approval
  profile: {
    photo: String,
    idDocumentUrl: String,
    bio: String,
    rating: { type: Number, default: 0 }
  },
  walletBalance: { type: Number, default: 0 },
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('User', userSchema);
