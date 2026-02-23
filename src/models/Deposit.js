import mongoose from 'mongoose';

const depositSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    amount: {
      type: Number,
      required: true,
      min: 0,
    },
    currency: {
      type: String,
      default: 'KZT',
    },
    interestRate: {
      type: Number,
      required: true,
    },
    duration: {
      type: Number, // in months
      required: true,
    },
    status: {
      type: String,
      enum: ['active', 'matured', 'closed', 'pending'],
      default: 'active',
    },
    startDate: {
      type: Date,
      default: Date.now,
    },
    endDate: Date,
    expectedInterest: Number,
    earnedInterest: {
      type: Number,
      default: 0,
    },
    autoRenewal: {
      type: Boolean,
      default: false,
    },
    depositType: {
      type: String,
      enum: ['fixed', 'flexible'],
      default: 'fixed',
    },
  },
  { timestamps: true }
);

export default mongoose.model('Deposit', depositSchema);
