import mongoose from 'mongoose';

const cashbackSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    transactionId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Transaction',
    },
    amount: {
      type: Number,
      required: true,
      min: 0,
    },
    percentage: {
      type: Number,
      required: true,
    },
    category: String,
    status: {
      type: String,
      enum: ['pending', 'credited', 'expired'],
      default: 'pending',
    },
    expiryDate: Date,
    usedDate: Date,
    usedInTransaction: mongoose.Schema.Types.ObjectId,
  },
  { timestamps: true }
);

export default mongoose.model('Cashback', cashbackSchema);
