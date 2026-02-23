import mongoose from 'mongoose';

const transferSchema = new mongoose.Schema(
  {
    senderId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    recipientType: {
      type: String,
      enum: ['phone', 'card', 'iban', 'account'],
      required: true,
    },
    recipientValue: {
      type: String,
      required: true,
    },
    recipientName: String,
    recipientId: mongoose.Schema.Types.ObjectId,
    amount: {
      type: Number,
      required: true,
      min: 0,
    },
    currency: {
      type: String,
      default: 'KZT',
    },
    fee: {
      type: Number,
      default: 0,
    },
    status: {
      type: String,
      enum: ['pending', 'completed', 'failed', 'cancelled'],
      default: 'pending',
    },
    transferType: {
      type: String,
      enum: ['domestic', 'international'],
      default: 'domestic',
    },
    description: String,
    reference: String,
    failureReason: String,
  },
  { timestamps: true }
);

export default mongoose.model('Transfer', transferSchema);
