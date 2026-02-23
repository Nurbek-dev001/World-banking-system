import mongoose from 'mongoose';

const productSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
    },
    description: String,
    category: {
      type: String,
      enum: [
        'electronics', 'clothing', 'furniture', 'books', 'toys',
        'home_appliances', 'beauty', 'sports', 'food', 'other'
      ],
      required: true,
    },
    price: {
      type: Number,
      required: true,
      min: 0,
    },
    currency: {
      type: String,
      default: 'KZT',
    },
    stock: {
      type: Number,
      default: 0,
    },
    seller: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
    },
    images: [String],
    rating: {
      type: Number,
      default: 0,
      min: 0,
      max: 5,
    },
    reviews: [
      {
        userId: mongoose.Schema.Types.ObjectId,
        rating: Number,
        comment: String,
        date: {
          type: Date,
          default: Date.now,
        },
      },
    ],
    installmentAvailable: {
      type: Boolean,
      default: true,
    },
    maxInstallments: {
      type: Number,
      default: 12,
    },
    discount: {
      type: Number,
      default: 0,
    },
    attributes: mongoose.Schema.Types.Mixed,
  },
  { timestamps: true }
);

export default mongoose.model('Product', productSchema);
