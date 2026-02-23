import mongoose from 'mongoose';

const loanSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    loanAmount: {
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
      default: 0,
    },
    duration: {
      type: Number, // in months
      required: true,
    },
    monthlyPayment: Number,
    totalPayable: Number,
    status: {
      type: String,
      enum: ['approved', 'pending', 'rejected', 'active', 'completed', 'defaulted'],
      default: 'pending',
    },
    remainingBalance: Number,
    nextPaymentDate: Date,
    disbursementDate: Date,
    endDate: Date,
    purpose: String,
    creditScore: Number,
    riskLevel: {
      type: String,
      enum: ['low', 'medium', 'high'],
    },
    payments: [
      {
        amount: Number,
        date: Date,
        status: {
          type: String,
          enum: ['paid', 'pending', 'overdue'],
        },
      },
    ],
  },
  { timestamps: true }
);

export default mongoose.model('Loan', loanSchema);
