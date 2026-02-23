import mongoose from 'mongoose';

const accountSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    accountNumber: {
      type: String,
      unique: true,
      required: true,
    },
    accountType: {
      type: String,
      enum: ['world_gold', 'savings', 'business'],
      default: 'world_gold',
    },
    currency: {
      type: String,
      enum: ['KZT', 'USD', 'EUR'],
      default: 'KZT',
    },
    balance: {
      type: Number,
      default: 0,
      min: 0,
    },
    availableBalance: {
      type: Number,
      default: 0,
    },
    status: {
      type: String,
      enum: ['active', 'frozen', 'closed'],
      default: 'active',
    },
    cards: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Card',
      },
    ],
    dailyLimit: Number,
    monthlyLimit: Number,
    spentToday: {
      type: Number,
      default: 0,
    },
    spentThisMonth: {
      type: Number,
      default: 0,
    },
    IBAN: String,
    BIC: String,
  },
  { timestamps: true }
);

export default mongoose.model('Account', accountSchema);
