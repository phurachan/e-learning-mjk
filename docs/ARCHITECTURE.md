# E-Learning MJK - Architecture Guide

## 📋 สารบัญ
1. [โครงสร้างโปรเจค](#โครงสร้างโปรเจค)
2. [หน้าที่ของแต่ละส่วน](#หน้าที่ของแต่ละส่วน)
3. [หลักการสำคัญ](#หลักการสำคัญ)
4. [ตัวอย่างการใช้งาน](#ตัวอย่างการใช้งาน)
5. [Best Practices](#best-practices)

---

## โครงสร้างโปรเจค

```
e-learning-mjk/
├── pages/                          # หน้าเว็บ (Routing)
├── components/                     # Vue Components
│   └── base/                      # Base Components (กลาง)
├── layouts/                        # Layouts
├── stores/                         # State Management (Pinia)
├── composables/
│   ├── constants/                 # Constants (API endpoints, etc.)
│   ├── store_models/              # Type definitions สำหรับ Stores
│   ├── utility_models/            # Type definitions สำหรับ Utilities
│   └── utilities/                 # Utility functions
│       └── useHttpClient.ts       # HTTP Client wrapper
├── server/
│   ├── api/                       # API Endpoints
│   ├── models/                    # Database Models
│   ├── middleware/                # Server Middleware
│   └── utils/
│       ├── filter_config/         # Filter configurations สำหรับแต่ละ resource
│       ├── queryParser.ts         # Query parser utility
│       └── responseHandler.ts     # Response handler utility
└── types/                         # TypeScript type definitions
```

---

## หน้าที่ของแต่ละส่วน

### 🎯 Frontend Layer

#### 1. **Pages** (`pages/`)
- รับผิดชอบแค่การแสดงผลและ routing
- **ห้าม** มี business logic หนักๆ
- **ห้าม** เรียก API โดยตรงด้วย `$fetch`
- ควรเรียกใช้ Store actions เท่านั้น

#### 2. **Components** (`components/`)
- แบ่งเป็น 2 ประเภท:
  - **Base Components**: Components พื้นฐานที่ใช้ร่วมกัน (ต้องตรวจสอบก่อนสร้างใหม่)
  - **Feature Components**: Components เฉพาะฟีเจอร์
- รับ props และ emit events
- ไม่ควรมี API calls

#### 3. **Stores** (`stores/`)
- จัดการ state แบบ global
- เรียก API ผ่าน `useHttpClient` เท่านั้น
- จัดการ loading, error, success states
- เก็บข้อมูลที่ได้จาก API

#### 4. **Composables**
- **`composables/constants/api.ts`**: กำหนด API endpoints ทั้งหมด
- **`composables/utilities/useHttpClient.ts`**: HTTP Client wrapper
  - จัดการ headers (Authorization, Content-Type)
  - แปลง query object เป็น query string
  - จัดการ errors และ interceptors
- **`composables/store_models/`**: Type definitions สำหรับ stores

---

### ⚙️ Backend Layer

#### 1. **API Endpoints** (`server/api/`)
- ใช้ `defineEventHandler`
- **ต้องใช้** `filter_config` และ `queryParser` เสมอ
- **ต้องใช้** `createSuccessResponse` และ `createPredefinedError`
- ตรวจสอบ authentication และ authorization

#### 2. **Filter Config** (`server/utils/filter_config/`)
- กำหนด allowed sort fields
- กำหนด searchable fields
- กำหนด filterable fields และ types
- ลดโค้ดซ้ำซ้อนในการ parse query

#### 3. **Query Parser** (`server/utils/queryParser.ts`)
- แปลง query string เป็น MongoDB filter
- จัดการ pagination
- จัดการ sorting
- จัดการ search

#### 4. **Response Handler** (`server/utils/responseHandler.ts`)
- `createSuccessResponse()`: สำหรับ response สำเร็จ
- `createPaginatedResponse()`: สำหรับ response แบบมี pagination
- `createPredefinedError()`: สำหรับ error response
- `API_RESPONSE_CODES`: Constants สำหรับ error/success messages

---

## หลักการสำคัญ

### 🚫 ❌ สิ่งที่ห้ามทำ

#### 1. **ห้ามเรียก API โดยตรงด้วย `$fetch`**
```typescript
// ❌ ผิด - อย่าทำแบบนี้
const data = await $fetch('/api/courses', {
  headers: {
    Authorization: `Bearer ${token}`
  }
})

// ✅ ถูกต้อง - ใช้ Store
const courseStore = useCourseStore()
await courseStore.fetchCourses({ body: {} })
```

#### 2. **ห้าม hardcode API endpoints**
```typescript
// ❌ ผิด
await httpClient.get('/api/users/123')

// ✅ ถูกต้อง
await httpClient.get(API_ENDPOINTS.USERS.SHOW('123'))
```

#### 3. **ห้ามสร้าง Components ใหม่โดยไม่ตรวจสอบ Base Components ก่อน**
```typescript
// ❌ ผิด - สร้าง Button component ใหม่
<button class="btn">Click</button>

// ✅ ถูกต้อง - ใช้ BaseButton ที่มีอยู่แล้ว
<BaseButton variant="primary">Click</BaseButton>
```

#### 4. **ห้ามสร้าง API endpoint โดยไม่ใช้ filter_config**
```typescript
// ❌ ผิด - parse query manually
export default defineEventHandler(async (event) => {
  const query = getQuery(event)
  const page = query.page || 1
  const limit = query.limit || 20
  const search = query.search || ''
  // ... manual parsing
})

// ✅ ถูกต้อง - ใช้ queryParser + filter_config
export default defineEventHandler(async (event) => {
  const query = getQuery(event)
  const { parsedQuery, mongoFilter } = parseQueryAndBuildFilter(
    query,
    createUserFilterConfig()
  )
})
```

#### 5. **ห้ามส่ง response แบบไม่มี standard format**
```typescript
// ❌ ผิด
return { data: users, total: 100 }

// ✅ ถูกต้อง
return createPaginatedResponse(users, {
  page: 1,
  limit: 20,
  total: 100,
  totalPages: 5
})
```

---

### ✅ วิธีที่ถูกต้อง

#### 1. **การเรียก API**

**Flow:** `Page/Component` → `Store` → `useHttpClient` → `API Endpoint`

```typescript
// 1. กำหนด endpoint ใน composables/constants/api.ts
export const API_ENDPOINTS = {
  COURSES: {
    LIST: '/courses',
    SHOW: (id: string) => `/courses/${id}`,
  }
}

// 2. สร้าง Store Model ใน composables/store_models/
export interface CourseListRequest {
  page?: number
  limit?: number
  search?: string
}

// 3. สร้าง Store Action ใน stores/
export const useCourseStore = defineStore('course', {
  actions: {
    async fetchCourses(requestData: BaseRequestData<CourseListRequest>) {
      try {
        this.$patch(loadingState(requestData))

        const httpClient = useHttpClient()
        const response = await httpClient.get(
          API_ENDPOINTS.COURSES.LIST,
          requestData.body
        )

        this.$patch(successState(response))
        this.list = response?.data || []

        return response
      } catch (error: any) {
        this.$patch(errorState(error?.data || error))
        throw new BaseResponseError(error?.data || error)
      } finally {
        this.isLoading = false
      }
    }
  }
})

// 4. เรียกใช้ใน Page/Component
const courseStore = useCourseStore()

const loadCourses = async () => {
  try {
    await courseStore.fetchCourses({
      body: {
        page: 1,
        limit: 20,
        search: searchQuery.value
      }
    })
  } catch (error) {
    console.error('Failed to load courses:', error)
  }
}
```

---

#### 2. **การสร้าง API Endpoint**

```typescript
// 1. สร้าง filter_config ใน server/utils/filter_config/course.ts
import { FilterConfig } from '../queryParser'

export function createCourseFilterConfig(): FilterConfig {
  return {
    allowedSortFields: ['name', 'code', 'createdAt'],
    defaultSortField: 'createdAt',
    defaultSortOrder: 'desc',
    searchFields: ['name', 'description'],
    filterFields: {
      name: { type: 'string', mongoField: 'name' },
      code: { type: 'string', mongoField: 'code' },
      isActive: { type: 'boolean', mongoField: 'isActive' }
    }
  }
}

// 2. สร้าง API endpoint ใน server/api/courses/index.get.ts
import Course from '~/server/models/Course'
import { createCourseFilterConfig } from '~/server/utils/filter_config/course'
import { parseQueryAndBuildFilter } from '~/server/utils/queryParser'
import {
  createPaginatedResponse,
  createPredefinedError,
  API_RESPONSE_CODES
} from '~/server/utils/responseHandler'
import { extractTokenFromHeader, verifyToken } from '~/server/utils/jwt'

export default defineEventHandler(async (event) => {
  try {
    // 1. Authentication
    const authHeader = getHeader(event, 'authorization')
    const token = extractTokenFromHeader(authHeader)

    if (!token) {
      throw createPredefinedError(API_RESPONSE_CODES.UNAUTHORIZED)
    }

    const decoded = verifyToken(token)

    // 2. Parse query using filter config
    const query = getQuery(event)
    const { parsedQuery, mongoFilter } = parseQueryAndBuildFilter(
      query,
      createCourseFilterConfig()
    )

    // 3. Count total
    const total = await Course.countDocuments(mongoFilter)

    // 4. Fetch data
    const courses = await Course.find(mongoFilter)
      .sort(parsedQuery.sort)
      .skip(parsedQuery.skip)
      .limit(parsedQuery.limit)
      .populate('teacher', 'name email')
      .lean()

    // 5. Return paginated response
    return createPaginatedResponse(courses, {
      page: parsedQuery.page,
      limit: parsedQuery.limit,
      total,
      totalPages: Math.ceil(total / parsedQuery.limit)
    })

  } catch (error: any) {
    if (error.statusCode) {
      throw error
    }

    console.error('Get courses error:', error)
    throw createPredefinedError(API_RESPONSE_CODES.INTERNAL_ERROR)
  }
})
```

---

#### 3. **การใช้ Base Components**

**ตรวจสอบ Base Components ที่มีอยู่:**
- `BaseButton` - ปุ่มต่างๆ
- `BaseIcon` - ไอคอน (ใช้ Lucide icons)
- `BaseInput` - Input fields
- `BaseModal` - Modal dialogs
- `BaseCard` - Card containers
- ฯลฯ

```typescript
// ❌ ผิด - สร้างใหม่
<button class="btn btn-primary" @click="handleClick">
  <svg>...</svg>
  Save
</button>

// ✅ ถูกต้อง - ใช้ BaseButton และ BaseIcon
<BaseButton variant="primary" @click="handleClick">
  <BaseIcon name="save" size="sm" />
  Save
</BaseButton>
```

---

## ตัวอย่างการใช้งาน

### ตัวอย่างที่ 1: สร้างหน้า List + Detail

#### Step 1: สร้าง Filter Config
```typescript
// server/utils/filter_config/product.ts
export function createProductFilterConfig(): FilterConfig {
  return {
    allowedSortFields: ['name', 'price', 'createdAt'],
    defaultSortField: 'createdAt',
    defaultSortOrder: 'desc',
    searchFields: ['name', 'description'],
    filterFields: {
      name: { type: 'string', mongoField: 'name' },
      category: { type: 'string', mongoField: 'category' },
      minPrice: { type: 'number', mongoField: 'price', operator: 'gte' },
      maxPrice: { type: 'number', mongoField: 'price', operator: 'lte' },
      isActive: { type: 'boolean', mongoField: 'isActive' }
    }
  }
}
```

#### Step 2: สร้าง API Endpoints
```typescript
// server/api/products/index.get.ts
export default defineEventHandler(async (event) => {
  // ... (ตามตัวอย่างด้านบน)
})

// server/api/products/[id].get.ts
export default defineEventHandler(async (event) => {
  const id = event.context.params?.id

  if (!id) {
    throw createPredefinedError(API_RESPONSE_CODES.MISSING_REQUIRED_FIELDS)
  }

  const product = await Product.findById(id)
    .populate('category')
    .lean()

  if (!product) {
    throw createPredefinedError(API_RESPONSE_CODES.NOT_FOUND)
  }

  return createSuccessResponse(product)
})
```

#### Step 3: เพิ่ม API Endpoints ใน constants
```typescript
// composables/constants/api.ts
export const API_ENDPOINTS = {
  // ... existing endpoints
  PRODUCTS: {
    LIST: '/products',
    SHOW: (id: string) => `/products/${id}`,
    CREATE: '/products',
    UPDATE: (id: string) => `/products/${id}`,
    DELETE: (id: string) => `/products/${id}`
  }
}
```

#### Step 4: สร้าง Store Models
```typescript
// composables/store_models/product.ts
import type { BaseState } from './base'
import type { IProduct } from '~/types/product'

export interface ProductState extends BaseState<ProductListRequest, IProduct> {
  currentProduct: IProduct | null
}

export interface ProductListRequest {
  page?: number
  limit?: number
  search?: string
  category?: string
  minPrice?: number
  maxPrice?: number
}

export interface ProductDetailRequest {
  productId: string
}
```

#### Step 5: สร้าง Store
```typescript
// stores/product.ts
export const useProductStore = defineStore('product', {
  state: (): ProductState => ({
    ...initState,
    currentProduct: null
  }),

  getters: {
    products: (state) => state.list ?? [],
    productById: (state) => (id: string) =>
      state.list?.find(p => p._id === id)
  },

  actions: {
    async fetchProducts(requestData: BaseRequestData<ProductListRequest>) {
      try {
        this.$patch(loadingState(requestData))

        const httpClient = useHttpClient()
        const response = await httpClient.get(
          API_ENDPOINTS.PRODUCTS.LIST,
          requestData.body
        )

        this.$patch(successState(response))
        this.list = response?.data || []
        this.pagination = response?.pagination || null

        return response
      } catch (error: any) {
        this.$patch(errorState(error?.data || error))
        throw new BaseResponseError(error?.data || error)
      } finally {
        this.isLoading = false
      }
    },

    async fetchProductDetail(requestData: BaseRequestData<ProductDetailRequest>) {
      try {
        this.$patch(loadingState(requestData))

        const httpClient = useHttpClient()
        const response = await httpClient.get(
          API_ENDPOINTS.PRODUCTS.SHOW(requestData.body!.productId)
        )

        this.$patch(successState(response))
        this.currentProduct = response?.data || null

        return response
      } catch (error: any) {
        this.$patch(errorState(error?.data || error))
        throw new BaseResponseError(error?.data || error)
      } finally {
        this.isLoading = false
      }
    }
  }
})
```

#### Step 6: สร้าง Pages
```vue
<!-- pages/products/index.vue -->
<template>
  <div class="container mx-auto px-4 py-8">
    <h1 class="text-3xl font-bold mb-6">Products</h1>

    <!-- Search -->
    <div class="mb-6">
      <input
        v-model="searchQuery"
        type="text"
        placeholder="Search products..."
        class="input input-bordered w-full"
        @input="handleSearch"
      >
    </div>

    <!-- Loading -->
    <div v-if="productStore.isLoading" class="flex justify-center py-12">
      <span class="loading loading-spinner loading-lg"></span>
    </div>

    <!-- Error -->
    <div v-else-if="productStore.isError" class="alert alert-error">
      {{ productStore.responseData?.message }}
    </div>

    <!-- Product List -->
    <div v-else class="grid grid-cols-1 md:grid-cols-3 gap-6">
      <div
        v-for="product in productStore.products"
        :key="product._id"
        class="card bg-base-100 shadow-xl cursor-pointer"
        @click="navigateTo(`/products/${product._id}`)"
      >
        <div class="card-body">
          <h2 class="card-title">{{ product.name }}</h2>
          <p>{{ product.price }} บาท</p>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
const productStore = useProductStore()
const searchQuery = ref('')

const handleSearch = () => {
  loadProducts()
}

const loadProducts = async () => {
  try {
    await productStore.fetchProducts({
      body: {
        page: 1,
        limit: 20,
        search: searchQuery.value
      }
    })
  } catch (error) {
    console.error('Failed to load products:', error)
  }
}

onMounted(() => {
  loadProducts()
})
</script>
```

```vue
<!-- pages/products/[id].vue -->
<template>
  <div class="container mx-auto px-4 py-8">
    <!-- Loading -->
    <div v-if="productStore.isLoading" class="flex justify-center py-12">
      <span class="loading loading-spinner loading-lg"></span>
    </div>

    <!-- Product Detail -->
    <div v-else-if="productStore.currentProduct" class="card bg-base-100 shadow-xl">
      <div class="card-body">
        <h1 class="card-title text-3xl">{{ productStore.currentProduct.name }}</h1>
        <p class="text-2xl text-primary">{{ productStore.currentProduct.price }} บาท</p>
        <p>{{ productStore.currentProduct.description }}</p>

        <div class="card-actions justify-end">
          <BaseButton variant="default" outline @click="router.back()">
            Back
          </BaseButton>
          <BaseButton variant="primary">
            Add to Cart
          </BaseButton>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
const route = useRoute()
const router = useRouter()
const productStore = useProductStore()

const productId = route.params.id as string

onMounted(async () => {
  try {
    await productStore.fetchProductDetail({
      body: { productId }
    })
  } catch (error) {
    console.error('Failed to load product:', error)
    router.push('/products')
  }
})
</script>
```

---

## Best Practices

### 1. **State Management**
- ใช้ Store สำหรับข้อมูลที่ใช้ร่วมกันหลายหน้า
- ใช้ local state (`ref`, `reactive`) สำหรับข้อมูลที่ใช้แค่ใน component เดียว

### 2. **Error Handling**
- ใช้ try-catch ใน Store actions
- แสดง error message ใน UI
- Log errors สำหรับ debugging

### 3. **Loading States**
- แสดง loading indicator เมื่อโหลดข้อมูล
- Disable ปุ่มเมื่อกำลัง submit

### 4. **Type Safety**
- ใช้ TypeScript ทุกที่
- สร้าง interface/type สำหรับ request/response
- ใช้ type guards เมื่อจำเป็น

### 5. **Performance**
- ใช้ `lean()` เมื่อ query MongoDB
- ใช้ pagination สำหรับข้อมูลจำนวนมาก
- Cache ข้อมูลที่ไม่เปลี่ยนบ่อยใน Store

### 6. **Security**
- ตรวจสอบ authentication ใน API endpoints
- ตรวจสอบ authorization (roles/permissions)
- Validate input data
- Sanitize user input

---

## Checklist สำหรับ Feature ใหม่

### Frontend
- [ ] สร้าง Store Model ใน `composables/store_models/`
- [ ] สร้าง Store ใน `stores/`
- [ ] เพิ่ม API Endpoints ใน `composables/constants/api.ts`
- [ ] สร้าง Pages/Components
- [ ] ใช้ Base Components ที่มีอยู่
- [ ] จัดการ Loading/Error states
- [ ] ทดสอบการทำงาน

### Backend
- [ ] สร้าง Filter Config ใน `server/utils/filter_config/`
- [ ] สร้าง API Endpoints ใน `server/api/`
- [ ] ใช้ `parseQueryAndBuildFilter` สำหรับ list endpoints
- [ ] ใช้ `createSuccessResponse` / `createPaginatedResponse`
- [ ] ใช้ `createPredefinedError` สำหรับ errors
- [ ] เพิ่ม Authentication/Authorization
- [ ] Validate input data
- [ ] ทดสอบ API endpoints

---

## การ Debug

### Frontend
```typescript
// ใช้ Vue Devtools
// ดู Store state และ actions
console.log('Store state:', productStore.$state)

// ดู API response
console.log('Response:', response)

// ดู computed values
console.log('Products:', productStore.products)
```

### Backend
```typescript
// Log query และ filter
console.log('Query:', query)
console.log('Mongo Filter:', mongoFilter)

// Log จำนวนข้อมูล
console.log('Total:', total)

// Log errors
console.error('Error:', error)
```

---

## สรุป

**กฎทอง 5 ข้อ:**

1. ✅ **ห้าม `$fetch` โดยตรง** - ใช้ `useHttpClient` และ Store เสมอ
2. ✅ **ใช้ State Management** - ลด code ซ้ำซ้อนและจัดการข้อมูลดีขึ้น
3. ✅ **ใช้ Filter Config** - ลด code ในการ parse query ใน API
4. ✅ **ใช้ Response Handler** - ให้ frontend จัดการ response ได้ง่าย
5. ✅ **ใช้ Base Components** - ตรวจสอบก่อนสร้างใหม่เสมอ

---

**หากมีข้อสงสัยหรือต้องการเพิ่มเติม กรุณาอัปเดตเอกสารนี้**

_Last Updated: 2025-11-03_
