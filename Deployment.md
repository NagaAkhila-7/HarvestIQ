# HarvestIQ Deployment Guide

## Production Deployment Checklist

### 1. Database Setup
- Provision MongoDB Atlas cluster or enterprise MongoDB replica set.
- Enable TLS/SSL connection strings.
- Ensure proper index creation on `organisationId`, `sku`, `poNumber`, `email`.

### 2. Backend Deployment
- Set `NODE_ENV=production`
- Configure CORS origins to match production domain names.
- Store secrets (`JWT_ACCESS_SECRET`, `GEMINI_API_KEY`) in secure environment variable stores (e.g. AWS Secrets Manager or HashiCorp Vault).
- Run server with PM2 or Docker container.

### 3. Frontend Deployment
- Execute production build:
  ```bash
  cd frontend
  npm run build
  ```
- Deploy the resulting `dist/` directory to Nginx, Vercel, or AWS S3 + CloudFront CDN.
