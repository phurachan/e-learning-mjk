# API Configuration Guide

## Overview
ระบบสามารถทำงานได้ 2 แบบ:
1. **SSR API** - API endpoints อยู่ใน same domain (เช่น `/api/auth/login`)
2. **External API** - API server แยกต่างหาก (เช่น `https://api.yourapp.com/v1`)

## Configuration

### 1. SSR API (Default)
**ใช้เมื่อ:** API endpoints อยู่ใน Nuxt server เดียวกัน

**Setup:**
```bash
# ใน .env file
NUXT_PUBLIC_API_BASE_URL=
# หรือไม่ต้องมี line นี้เลย
```

**API Calls จะเป็น:**
- Server-side: `/api/auth/login`  
- Client-side: `http://localhost:3000/api/auth/login`

### 2. External API Server
**ใช้เมื่อ:** มี API server แยกต่างหาก (Laravel, Express.js, etc.)

**Setup:**
```bash
# Development
NUXT_PUBLIC_API_BASE_URL=http://localhost:8000/api/v1

# Staging  
NUXT_PUBLIC_API_BASE_URL=https://staging-api.yourapp.com/v1

# Production
NUXT_PUBLIC_API_BASE_URL=https://api.yourapp.com/v1
```

**API Calls จะเป็น:**
- Server-side: `http://localhost:8000/api/v1/auth/login`
- Client-side: `http://localhost:8000/api/v1/auth/login`

## Environment Variables Priority

1. `runtimeConfig.public.apiBaseUrl` (from Nuxt runtime config)
2. `process.env.API_BASE_URL` (server-side only)  
3. `process.env.NUXT_PUBLIC_API_BASE_URL` (server-side only)
4. **Fallback**: SSR API (`/api` or `http://localhost:3000/api`)

## Usage Examples

### Development Scenarios

#### Scenario 1: Nuxt Full-Stack (SSR API)
```bash
# .env
NUXT_PUBLIC_API_BASE_URL=

# API endpoints in server/api/
# server/api/auth/login.post.ts
# server/api/auth/me.get.ts
```

#### Scenario 2: Nuxt + Laravel API
```bash
# .env
NUXT_PUBLIC_API_BASE_URL=http://localhost:8000/api/v1

# Laravel API running on port 8000
# Nuxt client on port 3000
```

#### Scenario 3: Nuxt + Express API
```bash
# .env  
NUXT_PUBLIC_API_BASE_URL=http://localhost:4000/api

# Express API on port 4000
# Nuxt client on port 3000
```

### Production Deployment

#### Single Server (SSR)
```bash
NUXT_PUBLIC_API_BASE_URL=
# API endpoints: /api/*
```

#### Microservices Architecture  
```bash
NUXT_PUBLIC_API_BASE_URL=https://api.yourapp.com/v1
# Frontend: https://yourapp.com
# API: https://api.yourapp.com/v1
```

## Code Usage

```typescript
// All API calls automatically use correct base URL
const authStore = useAuthStore()
await authStore.login(credentials) 

// Uses: /api/auth/login (SSR) 
// OR: http://localhost:8000/api/v1/auth/login (External)
```

## Testing Different Configurations

```bash
# Test SSR API
NUXT_PUBLIC_API_BASE_URL= yarn dev

# Test External API  
NUXT_PUBLIC_API_BASE_URL=http://localhost:8000/api/v1 yarn dev
```

## CORS Configuration

เมื่อใช้ External API Server ต้องตั้งค่า CORS:

**Laravel (config/cors.php):**
```php
'allowed_origins' => ['http://localhost:3000'],
```

**Express.js:**
```javascript
app.use(cors({
  origin: 'http://localhost:3000'
}));
```

## Troubleshooting

### 1. API calls fail in development
- ตรวจสอบว่า API server ทำงานอยู่
- ตรวจสอบ CORS configuration
- ตรวจสอบ port numbers ใน .env

### 2. Different behavior between dev/production
- ตรวจสอบ environment variables
- ตรวจสอบว่า API endpoints มีอยู่จริง

### 3. SSR hydration mismatches
- ตรวจสอบว่า server และ client ใช้ base URL เดียวกัน
- พิจารณาใช้ external API แทน SSR API