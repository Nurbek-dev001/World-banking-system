# World Bank - Digital Banking Platform

A complete digital banking platform - World Bank, built with modern technology stack.

## Features

### 1. Core Banking
- **World Gold Account** - Main debit account
- **Balance Management** - Check balance, view transactions
- **Card Management** - Create, update, delete cards
- **ATM Withdrawals** - Withdraw from any ATM

### 2. Transfers
- **Phone Number Transfers** - Most popular method
- **Card to Card** - Transfer between cards
- **Own Accounts** - Transfer between user accounts
- **International Transfers** - Send money abroad

### 3. Payments
- **Utilities** - Electricity, water, gas
- **Internet/Mobile** - Beeline, Kcell, Tele2
- **Government Services** - Taxes, fines, permits
- **Education** - School, university fees
- **Merchants** - Pay local businesses

### 4. Marketplace
- **Product Catalog** - Browse items
- **Shopping Cart** - Add items to cart
- **Installment Plans** - Buy now, pay later
- **Product Reviews** - Rate and review items

### 5. Credit & Deposits
- **Instant Loans** - Get loans in minutes
- **Fixed Deposits** - Earn interest
- **Flexible Deposits** - Withdraw anytime
- **Loan Management** - Track payments

### 6. QR Payments
- Scan and pay instantly
- Merchant QR codes
- Quick checkout

### 7. Analytics
- **Spending Categories** - Track spending by type
- **Monthly Reports** - Detailed analytics
- **Cashback Tracking** - Monitor rewards

### 8. Security
- PIN protection
- Biometric authentication
- SMS verification
- Two-factor authentication
- Transaction limits

## Project Structure

```
World Bank/
├── backend/                 # Node.js/Express API
│   ├── src/
│   │   ├── config/         # Database & environment
│   │   ├── controllers/    # Business logic
│   │   ├── models/         # MongoDB schemas
│   │   ├── routes/         # API routes
│   │   ├── services/       # Business services
│   │   ├── middleware/     # Auth & validation
│   │   └── utils/          # Helper functions
│   └── package.json
│
├── frontend/               # React Web App
│   ├── src/
│   │   ├── components/    # React components
│   │   ├── pages/         # Page components
│   │   ├── services/      # API services
│   │   ├── context/       # React context
│   │   ├── hooks/         # Custom hooks
│   │   └── utils/         # Helper functions
│   └── package.json
│
├── mobile/                # React Native App
│   ├── src/
│   │   ├── screens/      # Mobile screens
│   │   ├── components/   # Mobile components
│   │   ├── services/     # API services
│   │   ├── navigation/   # Navigation config
│   │   └── context/      # App context
│   └── package.json
│
├── admin/                 # Admin Dashboard
│   ├── src/
│   │   ├── pages/       # Admin pages
│   │   ├── components/  # Admin components
│   │   ├── services/    # API services
│   │   └── hooks/       # Custom hooks
│   └── package.json
│
└── docker-compose.yml    # Container orchestration
```

## Technology Stack

### Backend
- **Runtime**: Node.js
- **Framework**: Express.js
- **Database**: MongoDB
- **Cache**: Redis
- **Auth**: JWT + bcryptjs
- **Payment**: Stripe
- **SMS**: Twilio
- **Email**: Nodemailer

### Frontend
- **Framework**: React 18
- **Routing**: React Router
- **State**: Zustand
- **HTTP**: Axios
- **Charts**: Recharts
- **Date**: date-fns

### Mobile
- **Framework**: React Native
- **Navigation**: React Navigation
- **State**: Zustand
- **HTTP**: Axios

### Admin
- **Framework**: React 18
- **Build**: Vite
- **Charts**: Recharts

## Getting Started

### Prerequisites
- Node.js 18+
- MongoDB
- Docker (optional)

### Installation

1. **Backend Setup**
```bash
cd backend
npm install
cp .env.example .env
npm run dev
```

2. **Frontend Setup**
```bash
cd frontend
npm install
npm run dev
```

3. **Admin Setup**
```bash
cd admin
npm install
npm run dev
```

4. **Mobile Setup**
```bash
cd mobile
npm install
npm start
```

### Docker Setup
```bash
docker-compose up -d
```

## API Documentation

### Authentication
- `POST /api/auth/register` - Register user
- `POST /api/auth/login` - Login user
- `POST /api/auth/verify-phone` - Verify OTP
- `POST /api/auth/logout` - Logout

### Banking
- `GET /api/banking/accounts` - Get accounts
- `GET /api/banking/balance` - Get balance
- `POST /api/banking/deposit` - Deposit funds
- `POST /api/banking/withdraw` - Withdraw funds
- `GET /api/banking/cards` - Get cards
- `POST /api/banking/cards` - Create card

### Transfers
- `POST /api/transfers/phone` - Transfer by phone
- `POST /api/transfers/card` - Transfer by card
- `GET /api/transfers/history` - Transfer history

### Payments
- `POST /api/payments/utilities` - Pay utilities
- `POST /api/payments/internet` - Pay internet
- `POST /api/payments/education` - Pay education
- `GET /api/payments/categories` - Get categories

### Marketplace
- `GET /api/marketplace/products` - Get products
- `POST /api/marketplace/orders` - Create order
- `GET /api/marketplace/orders` - Get orders

### User
- `GET /api/users/profile` - Get profile
- `GET /api/users/analytics` - Get analytics
- `GET /api/users/cashback` - Get cashback
- `GET /api/users/loans` - Get loans

## Database Models

- **User** - User accounts with KYC
- **Account** - Bank accounts
- **Card** - Payment cards
- **Transaction** - Transaction history
- **Transfer** - Fund transfers
- **Loan** - Loan management
- **Deposit** - Savings deposits
- **Installment** - Payment plans
- **Product** - Marketplace items
- **Order** - Purchase orders
- **Cashback** - Reward points
- **QRPayment** - QR code payments

## Environment Variables

See `.env.example` for all required environment variables.

## Contributing

1. Fork the repository
2. Create a feature branch
3. Commit your changes
4. Push to the branch
5. Create a Pull Request

## License

MIT

## Support

For support, email support@worldbank.com or open an issue on GitHub.
