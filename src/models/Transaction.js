import mongoose from 'mongoose';

const transactionSchema = new mongoose.Schema(
  {
    fromUserId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
    },
    toUserId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
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
    type: {
      type: String,
      enum: ['transfer', 'payment', 'withdrawal', 'deposit', 'card_payment', 'cashback'],
      required: true,
    },
    status: {
      type: String,
      enum: ['pending', 'completed', 'failed', 'cancelled'],
      default: 'pending',
    },
    description: String,
    category: {
      type: String,
      enum: [
        'utilities', 'internet', 'mobile', 'education', 'health',
        'shopping', 'food', 'transport', 'entertainment', 'other'
      ],
    },
    merchant: {
      name: String,
      id: mongoose.Schema.Types.ObjectId,
      category: String,
    },
    paymentMethod: {
      type: String,
      enum: ['card', 'account', 'qr'],
    },
    fee: {
      type: Number,
      default: 0,
    },
    reference: String,
    remarks: String,
  },
  { timestamps: true }
);

// Index for faster queries
transactionSchema.index({ fromUserId: 1, createdAt: -1 });
transactionSchema.index({ toUserId: 1, createdAt: -1 });
transactionSchema.index({ status: 1, type: 1 });

export default mongoose.model('Transaction', transactionSchema);
