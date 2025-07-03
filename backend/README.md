# Backend - Fastify API

This is the backend service for the Personal Finance App, built with Fastify (Node.js).

## Features

- RESTful API for transactions, categories, budgets, and analytics
- JWT authentication
- SQLite (default) or PostgreSQL support
- Modular route and model structure

## Getting Started

### Environment Variables

Create a `.env` file in the backend directory:

```
PORT=3000
JWT_SECRET=your_jwt_secret
DATABASE_URL=sqlite://./finansdb.sqlite
```

### Development

Install dependencies:

```sh
npm install
```

Run the development server:

```sh
npm run dev
```

### API Endpoints

- `POST   /auth/register` Register a new user
- `POST   /auth/login` Login and get JWT
- `GET    /transactions` List transactions
- `POST   /transactions` Add transaction
- `PUT    /transactions/:id` Update transaction
- `DELETE /transactions/:id` Delete transaction
- ...and more for categories, budgets, analytics

### Example Request

```sh
curl -H "Authorization: Bearer <token>" http://localhost:3000/transactions
```

## License

MIT
