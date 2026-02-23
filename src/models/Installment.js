import mongoose from 'mongoose';

const installmentSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    orderId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Order',
    },
    totalAmount: {
      type: Number,
      required: true,
    },
    monthlyPayment: {
      type: Number,
      required: true,
    },
    numberOfInstallments: {
      type: Number,
      required: true,
    },
    interestRate: {
      type: Number,
      default: 0,
    },
    status: {
      type: String,
      enum: ['active', 'completed', 'defaulted', 'cancelled'],
      default: 'active',
    },
    startDate: {
      type: Date,
      default: Date.now,
    },
    endDate: Date,
    paidInstallments: {
      type: Number,
      default: 0,
    },
    remainingInstallments: Number,
    nextPaymentDate: Date,
    payments: [
      {
        installmentNumber: Number,
        amount: Number,
        dueDate: Date,
        paidDate: Date,
        status: {
          type: String,
          enum: ['pending', 'paid', 'overdue'],
        },
      },
    ],
  },
  { timestamps: true }
);

export default mongoose.model('Installment', installmentSchema);
