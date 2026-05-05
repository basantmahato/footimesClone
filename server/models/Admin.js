import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';

const adminSchema = new mongoose.Schema({
  username: {
    type: String,
    required: true,
    unique: true
  },
  password: {
    type: String,
    required: true
  },
  fullName: { // New field for full name
    type: String,
    required: true // Making it required, you can change to false if optional
  },
  profilePicture: { // New field for profile picture URL
    type: String,
    default: 'https://cdn-icons-png.flaticon.com/512/15239/15239514.png' // Default image path, or make it not required
  }
}, { timestamps: true }); // Added timestamps for createdAt and updatedAt

// Hash password before saving
adminSchema.pre('save', function (next) {
  if (!this.isModified('password')) return next();
  this.password = bcrypt.hashSync(this.password, 10);
  next();
});

export default mongoose.model('Admin', adminSchema);