import mongoose from 'mongoose';

const qrPaymentSchema = new mongoose.Schema(
  {
    merchantId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    qrCode: {
      type: String,
      unique: true,
      required: true,
    },
    totalAmount: {
      type: Number,
      required: true,
    },
    currency: {
      type: String,
      default: 'KZT',
    },
    description: String,
    status: {
      type: String,
      enum: ['active', 'inactive', 'expired'],
      default: 'active',
    },
    payments: [
      {
        payerId: mongoose.Schema.Types.ObjectId,
        amount: Number,
        date: Date,
        status: String,
      },
    ],
    totalCollected: {
      type: Number,
      default: 0,
    },
    expiryDate: Date,
    allowPartialPayment: {
      type: Boolean,
      default: false,
    },
  },
  { timestamps: true }
);

export default mongoose.model('QRPayment', qrPaymentSchema);
