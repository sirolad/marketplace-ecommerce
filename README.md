# Marketplace E-Commerce Platform

A microservices-based e-commerce platform built with Node.js and Docker.

## Services

- **Order Service**: Handles order processing and management
- **Invoice Service**: Manages invoice generation and processing

## Tech Stack

- Node.js 20.11.1 (LTS)
- MongoDB
- RabbitMQ
- Docker & Docker Compose
- ESLint & Prettier for code quality

## Project Structure

```
marketplace-ecommerce/
├── order-service/      # Order management service
├── invoice-service/    # Invoice processing service
├── docker-compose.yml  # Production Docker configuration
├── docker-compose.dev.yml # Development Docker configuration
└── .env.example        # Environment variables template
```

## Getting Started

1. Clone the repository:
```bash
git clone [repository-url]
cd marketplace-ecommerce
```

2. Set up environment variables:
```bash
cp .env.example .env
```

3. Install dependencies:
```bash
npm install
```

4. Start development environment:
```bash
npm run dev
```

5. For production:
```bash
npm start
```

## Available Scripts

- `npm run dev` - Start development environment
- `npm start` - Start production environment
- `npm run stop` - Stop containers
- `npm run clean` - Stop containers and remove volumes
- `npm test` - Run tests across all services
- `npm run lint` - Run ESLint
- `npm run format` - Format code with Prettier
- `npm run build` - Build all services

## Development

This project uses:
- ESLint for code linting
- Prettier for code formatting
- Husky for git hooks
- Lint-staged for pre-commit hooks

## Docker Setup

The project uses Docker Compose with separate configurations for development and production:
- Development: Hot-reload, debugging, and mounted volumes
- Production: Optimized builds and configurations

## Contributing

1. Create a feature branch
2. Commit changes
3. Push to the branch
4. Create a Pull Request

## License

[Your License]

