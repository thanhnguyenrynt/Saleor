# Saleor Next.js Storefront

[![Storefront Demo](https://img.shields.io/badge/VIEW%20DEMO-DFDFDF?style=for-the-badge)](https://storefront.saleor.io)

<div align="center">
  <p>A modern e-commerce storefront built with Next.js 14 and Saleor.</p>
  
  <a href="https://saleor.io/">Website</a>
  <span> • </span>
  <a href="https://docs.saleor.io/docs/3.x">Docs</a>
  <span> • </span>
  <a href="https://saleor.io/discord">Discord</a>
</div>

## Quick Start Guide
```bash
# Clone repository
cd storefront

# Paste .env.local or .env file

# Install pnpm if not already installed
npm install -g pnpm

# Install dependencies
pnpm i
```

### Run Development Server

```bash
pnpm dev
```

Visit `http://localhost:3000` to see your storefront.

## Key Features

- Next.js 14 with App Router and React Server Components
- TypeScript with GraphQL code generation
- TailwindCSS styling
- Complete checkout flow with multiple payment options
- Product catalog with categories, variants, and filters
- Account management and order history

## Payment Setup

For payments, install the [Saleor Adyen App](https://docs.saleor.io/docs/3.x/developer/app-store/apps/adyen) from the Saleor Dashboard.

## Development Tips

- After modifying GraphQL queries in the `gql` folder, run `pnpm run generate` to update types
- To preview draft content, visit `http://localhost:3000/api/draft`
- Check the [Next.js documentation](https://nextjs.org/docs) for framework-specific guidance

Need help? Join our [Discord community](https://saleor.io/discord)!
