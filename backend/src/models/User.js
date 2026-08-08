const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema({
  organisationId: { type: mongoose.Schema.Types.ObjectId, ref: 'Organisation', required: true, index: true },
  name: { type: String, required: true, trim: true },
  email: { type: String, required: true, unique: true, lowercase: true, trim: true },
  password: { type: String, required: true },
  role: { 
    type: String, 
    required: true,
    enum: ['Administrator', 'Procurement Manager', 'Inventory Planner', 'Warehouse User', 'Supplier', 'Finance Reviewer', 'Field Officer', 'Agronomist', 'Farmer', 'Viewer']
  },
  customPermissions: [{ type: String }],
  phone: { type: String, default: '' },
  mfaEnabled: { type: Boolean, default: false },
  mfaSecret: { type: String, default: '' },
  isActive: { type: Boolean, default: true },
  refreshTokenHash: { type: String, default: '' },
  lastLoginAt: { type: Date },
  resetPasswordToken: { type: String, default: '' },
  resetPasswordExpires: { type: Date },
  isDeleted: { type: Boolean, default: false }
}, { timestamps: true });

userSchema.pre('save', async function (next) {
  if (!this.isModified('password')) return next();
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
  next();
});

userSchema.methods.comparePassword = async function (enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password);
};

module.exports = mongoose.model('User', userSchema);
