import mongoose from 'mongoose';

const orderSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    items: [
      {
        productId: mongoose.Schema.Types.ObjectId,
        quantity: Number,
        price: Number,
        installmentOption: {
          duration: Number,
          monthlyPayment: Number,
        },
      },
    ],
    totalAmount: {
      type: Number,
      required: true,
    },
    currency: {
      type: String,
      default: 'KZT',
    },
    discount: {
      type: Number,
      default: 0,
    },
    tax: {
      type: Number,
      default: 0,
    },
    finalAmount: Number,
    status: {
      type: String,
      enum: ['pending', 'confirmed', 'processing', 'shipped', 'delivered', 'cancelled', 'returned'],
      default: 'pending',
    },
    shippingAddress: {
      street: String,
      city: String,
      zipCode: String,
      country: String,
    },
    paymentMethod: {
      type: String,
      enum: ['card', 'installment', 'full_payment'],
    },
    paymentStatus: {
      type: String,
      enum: ['pending', 'completed', 'failed'],
      default: 'pending',
    },
    trackingNumber: String,
    estimatedDelivery: Date,
    actualDelivery: Date,
  },
  { timestamps: true }
);

export default mongoose.model('Order', orderSchema);
