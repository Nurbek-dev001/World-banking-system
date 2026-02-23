# World Bank Backend API

Complete Node.js/Express backend for the World Bank digital banking platform.

## Quick Start

### Prerequisites

- Node.js 14+ 
- MongoDB 4.0+
- Redis 5.0+
- npm or yarn

### Installation

```bash
# Install dependencies
npm install

# Create .env file (copy from root project .env)
cp ../.env backend/.env

# Start development server
npm run dev
```

## Project Structure

```
src/
├── config/
│   ├── database.js          # MongoDB connection
│   └── redis.js             # Redis configuration
│
├── controllers/             # Business logic (expand as needed)
│   ├── authController.js
│   ├── bankingController.js
│   └── ...
│
├── middleware/
│   ├── auth.middleware.js   # JWT authentication
│   ├── errorHandle.middle.js # Error handling
│   └── validation.middleware.js # Input validation (NEW)
│
├── models/                  # MongoDB schemas
│   ├── User.js
│   ├── Account.js
│   ├── Card.js
│   ├── Transaction.js
│   ├── Loan.js
│   ├── Deposit.js
│   ├── Transfer.js
│   ├── QRPayment.js
│   ├── Order.js
│   ├── Product.js
│   ├── Cashback.js
│   └── Installment.js
│
├── routes/                  # API route definitions
│   ├── auth.routes.js
│   ├── banking.routes.js
│   ├── payment.routes.js
│   ├── transfer.routes.js
│   ├── marketplace.routes.js
│   ├── user.routes.js
│   ├── loan.routes.js
│   ├── deposit.routes.js
│   ├── qr.routes.js
│   ├── merchant.routes.js
│   ├── notification.routes.js
│   └── admin.routes.js
│
├── services/               # Business logic services
│   └── index.js            # Service exports
│
├── utils/
│   ├── jwt.js              # JWT token generation
│   ├── errorHandler.js     # Custom error classes (NEW)
│   └── logger.js           # Structured logging (NEW)
│
├── server.js               # Express app setup
└── tests/                  # Test files
```

## Environment Variables

See `.env` file for all configuration options:

```env
# Server
NODE_ENV=development
PORT=5000

# Database
MONGODB_URI=mongodb://localhost:27017/world-bank
MONGODB_USER=admin
MONGODB_PASSWORD=admin123

# Redis Cache
REDIS_URI=redis://localhost:6379

# JWT
JWT_SECRET=your-secret-key
JWT_EXPIRE=7d

# CORS
ALLOWED_ORIGINS=http://localhost:3000,http://localhost:3001

# Email (Optional)
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your-email@gmail.com
SMTP_PASSWORD=your-password

# Twilio SMS (Optional)
TWILIO_ACCOUNT_SID=your-account-id
TWILIO_AUTH_TOKEN=your-token
TWILIO_PHONE_NUMBER=+1234567890

# Stripe Payment (Optional)
STRIPE_SECRET_KEY=sk_test_xxx
STRIPE_PUBLISHABLE_KEY=pk_test_xxx

# API Configuration
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX_REQUESTS=100
MAX_FILE_SIZE=5242880
LOG_LEVEL=info
```

## Available Scripts

```bash
# Start development server with auto-reload
npm run dev

# Start production server
npm start

# Run tests
npm test

# Run tests in watch mode
npm run test:watch

# Lint code
npm run lint
```

## Key Features

### ✅ Authentication
- User registration and login
- JWT token-based authentication
- Phone number verification with OTP
- Password security with bcryptjs

### ✅ Account Management
- Multiple account types (checking, savings, etc.)
- Real-time balance tracking
- Account statements
- Card management

### ✅ Transactions
- Fund transfers (phone, card, account)
- Payment processing
- Transaction history
- Transaction receipts

### ✅ Credit & Savings
- Personal loans with flexible terms
- Fixed and flexible deposits
- Interest calculations
- Loan payment tracking

### ✅ Marketplace
- Product catalog
- Shopping cart
- Installment plans
- Order tracking

### ✅ Security
- Rate limiting on all endpoints
- Input validation and sanitization
- HTTPS/TLS in production
- CORS configuration
- Helmet.js security headers

### ✅ Logging & Monitoring
- Structured logging system
- Request/response logging
- Performance monitoring
- Error tracking

## API Endpoints

### Authentication
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - User login
- `POST /api/auth/verify-phone` - Verify phone with OTP
- `POST /api/auth/logout` - Logout user

### Banking
- `GET /api/banking/accounts` - Get user accounts
- `GET /api/banking/balance` - Get account balance
- `GET /api/banking/cards` - Get user cards
- `POST /api/banking/deposit` - Deposit funds

### Payments
- `POST /api/payments/make` - Make payment
- `GET /api/payments/history` - Get payment history

### Transfers
- `POST /api/transfers/send` - Send money
- `POST /api/transfers/card-to-card` - Card to card transfer

### Loans
- `GET /api/loans/available` - Get available loan products
- `POST /api/loans/apply` - Apply for loan
- `GET /api/loans/:id` - Get loan details

### More endpoints in [API_DOCUMENTATION.md](../API_DOCUMENTATION.md)

## Database Design

### Core Collections

**Users**
```javascript
{
  _id: ObjectId,
  firstName: String,
  lastName: String,
  email: String (unique),
  phone: String (unique),
  password: String (hashed),
  dateOfBirth: Date,
  idNumber: String,
  address: {
    street: String,
    city: String,
    zipCode: String,
    country: String
  },
  role: enum(['user', 'merchant', 'admin']),
  status: enum(['active', 'suspended', 'blocked']),
  kycStatus: String,
  createdAt: Date,
  updatedAt: Date
}
```

**Accounts**
```javascript
{
  _id: ObjectId,
  userId: ObjectId (ref: User),
  accountNumber: String (unique),
  accountType: String,
  balance: Number,
  currency: String,
  status: String,
  createdAt: Date,
  updatedAt: Date
}
```

**Transactions**
```javascript
{
  _id: ObjectId,
  userId: ObjectId (ref: User),
  fromAccount: ObjectId (ref: Account),
  toAccount: ObjectId (ref: Account),
  amount: Number,
  type: enum(['transfer', 'payment', 'deposit', 'withdrawal']),
  status: enum(['pending', 'completed', 'failed']),
  description: String,
  referenceNumber: String,
  createdAt: Date
}
```

See individual model files for complete schemas.

## Error Handling

The application uses custom error classes:

```javascript
// Examples
throw new BadRequestError('Invalid email format');
throw new UnauthorizedError('Token expired');
throw new NotFoundError('User');
throw new ConflictError('User with this email already exists');
throw new ValidationError('Validation failed', errors);
```

## Middleware Stack

1. **helmet** - Security headers
2. **cors** - Cross-origin requests
3. **express.json** - JSON parsing
4. **requestLogger** - Request logging
5. **performanceMonitor** - Performance tracking
6. **routes** - API routes
7. **404 handler** - Route not found
8. **globalErrorHandler** - Centralized error handling

## Testing

### Unit Tests
```bash
npm test
```

### Running Specific Tests
```bash
npm test -- --testNamePattern="auth"
```

### Test Coverage
```bash
npm test -- --coverage
```

## Performance Tips

1. **Database Indexing** - Create indexes on frequently queried fields
2. **Redis Caching** - Cache frequently accessed data
3. **Pagination** - Always paginate list endpoints
4. **Query Optimization** - Use select() to limit fields
5. **Connection Pooling** - MongoDB manages this automatically

## Deployment

### Docker
```bash
docker build -t world-bank-api .
docker run -p 5000:5000 --env-file .env world-bank-api
```

### Docker Compose
```bash
docker-compose up -d backend
```

### Environment for Production
```env
NODE_ENV=production
JWT_SECRET=use-strong-random-key
MONGODB_URI=production-mongodb-uri
```

## Troubleshooting

### MongoDB Connection Failed
- Ensure MongoDB is running: `mongod`
- Check MONGODB_URI in .env
- Verify credentials

### Redis Connection Failed
- Ensure Redis is running: `redis-server`
- Check REDIS_URI in .env

### Port Already in Use
```bash
# Kill process on port 5000
lsof -ti:5000 | xargs kill -9
```

## Contributing

1. Create a new branch for your feature
2. Make changes and write tests
3. Submit a pull request
4. Code review and merge

## Security Checklist

- [ ] All inputs are validated
- [ ] Sensitive data is not logged
- [ ] Use environment variables for secrets
- [ ] HTTPS enabled in production
- [ ] CORS properly configured
- [ ] Rate limiting enabled
- [ ] SQL/NoSQL injection prevention
- [ ] XSS prevention with helmet.js
- [ ] Passwords are bcrypted

## Resources

- [Express.js Documentation](https://expressjs.com/)
- [Mongoose Documentation](https://mongoosejs.com/)
- [JWT Best Practices](https://tools.ietf.org/html/rfc7519)
- [OWASP Security Guidelines](https://owasp.org/)

## License

MIT

## Support

- Email: backend@worldbank.com
- Documentation: [API Documentation](../API_DOCUMENTATION.md)
- Issues: [Improvements](../IMPROVEMENTS.md)

