# i18n และ Error Handling System

## ภาพรวมระบบ

ระบบ i18n และ error handling ที่พัฒนาให้รองรับการทำงานแบบหลายภาษา (ไทย/อังกฤษ) และการจัดการข้อผิดพลาดจาก API อย่างเป็นระบบ

## การติดตั้งและการตั้งค่า

### 1. Dependencies ที่ติดตั้งแล้ว
```bash
yarn add @nuxtjs/i18n
```

### 2. Nuxt Configuration
```typescript
// nuxt.config.ts
modules: ['@nuxtjs/i18n'],
i18n: {
  locales: [
    { code: 'th', iso: 'th-TH', name: 'ไทย' },
    { code: 'en', iso: 'en-US', name: 'English' }
  ],
  defaultLocale: 'th',
  strategy: 'prefix_except_default',
  detectBrowserLanguage: {
    useCookie: true,
    cookieKey: 'i18n_redirected',
    redirectOn: 'root'
  },
  vueI18n: './i18n.config.ts'
}
```

### 3. i18n Configuration File
```typescript
// i18n.config.ts
export default defineI18nConfig(() => ({
  legacy: false,
  locale: 'th',
  messages: {
    th: {
      // Thai translations
    },
    en: {
      // English translations
    }
  }
}))
```

## โครงสร้างไฟล์

```
i18n.config.ts           # i18n configuration file
locales/                 # JSON files (backup/reference)
├── th.json              # ข้อความภาษาไทย
└── en.json              # ข้อความภาษาอังกฤษ

composables/
├── useErrorHandler.ts    # จัดการ error และ mapping
└── useAlert.ts          # จัดการ alert และ notifications

components/
├── GlobalAlert.vue      # Global alert component
└── LanguageSwitcher.vue # Language switcher component
```

## การใช้งาน i18n

### 1. ในหน้า Template
```vue
<template>
  <div>
    <!-- ใช้ $t() function -->
    <h1>{{ $t('common.welcome') }}</h1>
    <button>{{ $t('common.save') }}</button>

    <!-- ใส่ dynamic value -->
    <p>{{ $t('common.confirm_delete_item', { item: 'User' }) }}</p>
  </div>
</template>
```

### 2. ใน Script Setup
```vue
<script setup lang="ts">
const { $i18n } = useNuxtApp()

// Get current locale
const currentLocale = $i18n.locale.value // 'th' หรือ 'en'

// Change locale
await $i18n.setLocale('en')

// Get translated text
const message = $i18n.t('common.success')
</script>
```

### 3. Language Switcher
```vue
<template>
  <LanguageSwitcher />
</template>
```

## การจัดการ Error และ Alert

### 1. useErrorHandler Composable

```typescript
const { handleAPIError, handleAPISuccess, handleValidationErrors } = useErrorHandler()

// Handle API Error
try {
  await $fetch('/api/users')
} catch (error) {
  handleAPIError(error)
}

// Handle API Success
handleAPISuccess('CREATE_SUCCESS')

// Handle Validation Errors
handleValidationErrors({
  name: ['USER_NAME_REQUIRED'],
  email: ['USER_EMAIL_INVALID_FORMAT']
})
```

### 2. useAlert Composable

```typescript
const { showSuccess, showError, showWarning, showInfo, showConfirm } = useAlert()

// Show different types of alerts
showSuccess('บันทึกข้อมูลสำเร็จ')
showError('เกิดข้อผิดพลาด')
showWarning('กรุณาตรวจสอบข้อมูล')
showInfo('ข้อมูลได้รับการอัพเดท')

// Show confirmation dialog
const result = await showConfirm({
  title: 'ยืนยันการลบ',
  message: 'คุณแน่ใจหรือไม่ที่จะลบข้อมูลนี้?'
})

if (result) {
  // User confirmed
  deleteItem()
}
```

## โครงสร้างข้อความใน Locale Files

### common - ข้อความทั่วไป
```json
{
  "common": {
    "save": "บันทึก",
    "cancel": "ยกเลิก",
    "delete": "ลบ",
    "edit": "แก้ไข",
    "success": "สำเร็จ",
    "error": "ข้อผิดพลาด"
  }
}
```

### errors - ข้อความข้อผิดพลาด
```json
{
  "errors": {
    "INVALID_EMAIL_PASSWORD": "อีเมลหรือรหัสผ่านไม่ถูกต้อง",
    "USER_NOT_FOUND": "ไม่พบผู้ใช้งาน",
    "VALIDATION_FAILED": "การตรวจสอบข้อมูลล้มเหลว"
  }
}
```

### validation - ข้อความ validation
```json
{
  "validation": {
    "USER_NAME_REQUIRED": "กรุณากรอกชื่อ",
    "USER_EMAIL_REQUIRED": "กรุณากรอกอีเมล",
    "USER_PASSWORD_MIN_LENGTH": "รหัสผ่านต้องมีอย่างน้อย 6 ตัวอักษร"
  }
}
```

### fields - ชื่อฟิลด์
```json
{
  "fields": {
    "name": "ชื่อ",
    "email": "อีเมล",
    "password": "รหัสผ่าน",
    "role": "บทบาท"
  }
}
```

## การ Map Error จาก API Response

### Server Response Format
```typescript
// API Error Response
{
  statusCode: 400,
  statusMessage: 'INVALID_USER_ID',
  data: {
    messages: {
      th: 'รหัสผู้ใช้งานไม่ถูกต้อง',
      en: 'Invalid user ID'
    },
    errors: {
      name: ['USER_NAME_REQUIRED'],
      email: ['USER_EMAIL_INVALID_FORMAT']
    }
  }
}
```

### การใช้งานใน Frontend
```typescript
// API call example
const saveUser = async (userData) => {
  try {
    const response = await $fetch('/api/users', {
      method: 'POST',
      body: userData
    })

    handleAPISuccess('CREATE_SUCCESS')
    return response
  } catch (error) {
    handleAPIError(error)
    throw error
  }
}
```

## การ Integrate กับ BaseAlert Component

### Global Alert System
```vue
<!-- app.vue -->
<template>
  <div>
    <NuxtLayout>
      <NuxtPage />
    </NuxtLayout>

    <!-- Global Alert Component -->
    <GlobalAlert />
  </div>
</template>
```

### การใช้งาน BaseAlert ใน Component
```vue
<template>
  <BaseAlert
    v-model:visible="isVisible"
    type="success"
    :title="$t('common.success')"
    :message="$t('success.SAVE_SUCCESS')"
    position="top"
  />
</template>
```

## การทดสอบ

1. เปิดหน้า `/admin/i18n-test` เพื่อทดสอบระบบ
2. ทดสอบการเปลี่ยนภาษาผ่าน Language Switcher
3. ทดสอบ Alert แต่ละประเภท
4. ทดสอบ API Error และ Validation Error

## Best Practices

### 1. การตั้งชื่อ Key
- ใช้ตัวพิมพ์ใหญ่สำหรับ error และ success messages
- ใช้ snake_case สำหรับ common และ field names
- จัดกลุ่มตาม module/หน้าที่

### 2. การจัดการ Error
- ใช้ `handleAPIError()` สำหรับ error จาก API
- ใช้ `handleValidationErrors()` สำหรับ validation errors
- ใช้ `showConfirm()` สำหรับการยืนยันการกระทำ

### 3. การแสดงผล
- ใช้ Global Alert สำหรับ feedback ทั่วไป
- ใช้ inline validation สำหรับ form fields
- ใช้ confirm dialog สำหรับการกระทำที่เสี่ยง

## การเพิ่มภาษาใหม่

1. เพิ่ม locale ใหม่ใน `nuxt.config.ts`
2. เพิ่ม translations ใน `i18n.config.ts`
3. เพิ่มตัวเลือกใน `LanguageSwitcher.vue`
4. อัพเดท server response ให้รองรับภาษาใหม่

## แก้ไข Build Error

หาก Nuxt มี error เกี่ยวกับการโหลดไฟล์ locale:

1. **ใช้ i18n.config.ts**: แทนการใช้ langDir และ file properties
2. **Clean cache**: ลบ .nuxt และ .output folders
3. **Restart dev server**: หลังจากแก้ไข config

```bash
# Clean Nuxt cache
rm -rf .nuxt .output

# ตรวจสอบไฟล์ config
ls i18n.config.ts

# Restart dev server
yarn dev
```

**หาก Error ยังคงเกิดขึ้น:**
- ใช้ `i18n.config.ts` แทน `langDir` + `file` properties
- ย้าย translations จาก JSON files ไปใน `i18n.config.ts`
- Clean cache และ restart server