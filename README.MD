# Payment Microservice

A robust payment processing microservice built with Node.js and Stripe, handling secure payment transactions with webhook-based confirmations.

## Tech Stack

- **Node.js** - Runtime environment
- **Express.js** - Web framework
- **PostgreSQL** - Database
- **Prisma** - ORM (Object-Relational Mapping)
- **Stripe** - Payment processing

## Features

- Secure payment processing with Stripe Checkout
- Webhook-based payment confirmations
- Payment status tracking
- Receipt URL generation
- Pagination support for payment history
- Comprehensive error handling

## API Endpoints

### Create Payment Session

```bash
# Request
curl -X POST http://localhost:3000/api/v1/payments \
  -H "Content-Type: application/json" \
  -d '{
    "customerId": "customer123",
    "items": [
      {
        "price_data": {
          "currency": "usd",
          "unit_amount": 2000,
          "product_data": {
            "name": "Product Name"
          }
        },
        "quantity": 1
      }
    ],
    "success_url": "https://yoursite.com/success",
    "cancel_url": "https://yoursite.com/cancel"
  }'

# Successful Response (200 OK)
{
    "url": "https://checkout.stripe.com/c/pay/cs_test_..." // Stripe Checkout URL
}

# Error Response (400 Bad Request)
{
    "error": "Invalid request body"
}

# Error Response (505)
{
    "error": "Error message from Stripe"
}
```

### Get Payments History

```bash
# Request
curl -X GET "http://localhost:3000/api/v1/payments?payerid=customer123&limit=10&offset=0"

# Successful Response (200 OK)
[
    {
        "id": "uuid-payment-id",
        "amount": 2000,
        "currency": "usd",
        "status": "succeeded",
        "createdAt": "2024-03-15T10:30:00Z",
        "items": [
            {
                "price_data": {
                    "currency": "usd",
                    "unit_amount": 2000,
                    "product_data": {
                        "name": "Product Name"
                    }
                },
                "quantity": 1
            }
        ]
    }
    // ... more payments
]

# Error Response (400 Bad Request)
{
    "error": "payerid is required"
}

# Error Response (400 Bad Request - Invalid Limit)
{
    "error": "Limit cannot be greater than 100"
}
```

### Get Payment Receipt

```bash
# Request
curl -X GET "http://localhost:3000/api/v1/payments/receipts?paymentid=payment123"

# Successful Response (200 OK)
{
    "receiptUrl": "https://receipt.stripe.com/..."
}

# Error Response (404 Not Found)
{
    "error": "Succeeded payment not found, status: pending"
}

# Error Response (400 Bad Request)
{
    "error": "paymentid is required"
}

# Error Response (505)
{
    "error": "Internal server error message"
}
```

### Response Status Codes

- `200 OK`: Request successful
- `400 Bad Request`: Invalid parameters or request body
- `404 Not Found`: Resource not found
- `505`: Internal server error or Stripe API error

### Payment Status Values

The `status` field in responses can have the following values:

- `initiated`: Payment just created
- `created`: Checkout session created
- `pi_created`: Payment intent created
- `succeeded`: Payment completed successfully
- `failed`: Payment failed
- `expired`: Checkout session expired
- `pi_cancelled`: Payment intent cancelled

### Pagination

The payments history endpoint supports pagination with:

- `limit`: Number of items per page (default: 10, max: 100)
- `offset`: Number of items to skip (default: 0)
- `status`: Optional filter for payment status

## Database Schema

The service uses PostgreSQL with the following main schema:

```prisma
model Payment {
  id                String   @id @default(uuid())
  paymentIntentId   String?  @unique
  checkoutSessionId String?  @unique
  receiptUrl        String?
  payerId           String?
  amount            Int
  currency          String
  status            String
  items             Json[]
  createdAt         DateTime @default(now())
  updatedAt         DateTime @updatedAt
}
```

## Payment Flow

1. Client initiates payment by creating a checkout session
2. User is redirected to Stripe Checkout
3. Payment confirmation is handled via webhooks
4. Payment status is updated in the database
5. Receipt URL is generated for successful payments

## Webhook Events Handled

- `checkout.session.completed`
- `payment_intent.succeeded`
- `payment_intent.failed`
- `payment_intent.created`
- `payment_intent.cancelled`
- `checkout.session.expired`
- `charge.failed`

## Environment Variables

```env
DATABASE_URL="postgresql://user:password@localhost:5432/payment_db"
STRIPE_SECRET_KEY="sk_test_..."
STRIPE_WEBHOOK_SECRET="whsec_..."
```

## Setup Instructions

1. Clone the repository
2. Install dependencies:
   ```bash
   npm install
   ```
3. Set up environment variables
4. Run database migrations:
   ```bash
   npx prisma migrate dev
   ```
5. Start the server:
   ```bash
   npm start
   ```

## Webhook Setup

1. Install Stripe CLI
2. Forward webhooks locally:
   ```bash
   stripe listen --forward-to localhost:3000/webhook
   ```
3. Use the provided webhook signing secret in your environment variables

## Error Handling

The service includes comprehensive error handling for:

- Invalid requests
- Payment processing failures
- Database errors
- Webhook verification failures

## Security Features

- Stripe signature verification for webhooks
- Request validation middleware
- Secure environment variable management
- CORS protection
