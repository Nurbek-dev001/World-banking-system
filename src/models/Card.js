import mongoose from 'mongoose';

const cardSchema = new mongoose.Schema(
  {
    accountId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Account',
      required: true,
    },
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    cardNumber: {
      type: String,
      unique: true,
      required: true,
    },
    cardHolderName: String,
    expiryDate: String,
    cvv: String,
    cardType: {
      type: String,
      enum: ['debit', 'credit'],
      default: 'debit',
    },
    cardStatus: {
      type: String,
      enum: ['active', 'blocked', 'expired', 'cancelled'],
      default: 'active',
    },
    limit: Number,
    spentAmount: {
      type: Number,
      default: 0,
    },
    isDefault: {
      type: Boolean,
      default: false,
    },
    contactlessEnabled: {
      type: Boolean,
      default: true,
    },
    onlinePaymentsEnabled: {
      type: Boolean,
      default: true,
    },
    atmWithdrawalsEnabled: {
      type: Boolean,
      default: true,
    },
  },
  { timestamps: true }
);

export default mongoose.model('Card', cardSchema);
