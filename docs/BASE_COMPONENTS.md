# Base Components Reference

รายการ Base Components ที่มีในโปรเจค - ใช้ components เหล่านี้แทนการสร้างใหม่

## 🎯 หลักการใช้งาน

**✅ DO**: ใช้ Base Components ที่มีอยู่แล้ว
```vue
<BaseButton variant="primary" @click="handleClick">Click</BaseButton>
<BaseIcon name="academic-cap" size="md" />
<BaseInput v-model="name" label="ชื่อ" />
```

**❌ DON'T**: Import Heroicons โดยตรงหรือสร้าง component ใหม่
```vue
<!-- ไม่ถูกต้อง -->
<button class="btn btn-primary">Click</button>
<AcademicCapIcon class="w-5 h-5" />
```

---

## 📦 Base Components ทั้งหมด

### Form Components

#### 1. **BaseButton** - ปุ่มทุกประเภท
```vue
<BaseButton
  variant="primary"    // default | primary | secondary | accent | info | success | warning | error | ghost | link
  size="md"           // xs | sm | md | lg
  :loading="false"
  :disabled="false"
  :outline="false"
  :block="false"
  icon-left="check"   // Heroicon name
  icon-right="arrow-right"
  @click="handleClick"
>
  Button Text
</BaseButton>
```

**Props:**
- `variant`: สีและสไตล์ปุ่ม
- `size`: ขนาดปุ่ม
- `loading`: แสดง loading spinner
- `disabled`: ปิดการใช้งาน
- `outline`: ปุ่มแบบ outline
- `block`: เต็มความกว้าง
- `ghost`, `glass`, `square`, `circle`, `wide`, `active`
- `iconLeft`, `iconRight`: ชื่อ icon จาก Heroicons
- `loadingText`, `successText`: ข้อความขณะ loading/success

#### 2. **BaseInput** - Input field พร้อม validation
```vue
<BaseInput
  v-model="formData.name"
  type="text"         // text | email | password | number | tel | url
  label="ชื่อ"
  placeholder="กรอกชื่อ"
  :required="true"
  :error="errors.name"
  hint="กรุณากรอกชื่อเต็ม"
  size="md"           // xs | sm | md | lg
  variant="default"   // default | bordered | ghost | primary | error
  :disabled="false"
  :readonly="false"
  :minlength="2"
  :maxlength="100"
  @update:error="errors.name = $event"
/>
```

**Features:**
- Auto validation (required, email, minlength, maxlength, min, max)
- Error display
- Helper text
- Multiple types

#### 3. **BaseSelect** - Dropdown select
```vue
<BaseSelect
  v-model="formData.category"
  label="หมวดหมู่"
  :options="categories"
  :required="true"
  size="md"
  variant="default"
/>
```

#### 4. **BaseTextarea** - Text area
```vue
<BaseTextarea
  v-model="formData.description"
  label="คำอธิบาย"
  :rows="4"
  :required="false"
  :maxlength="500"
/>
```

#### 5. **BaseCheckbox** - Checkbox
```vue
<BaseCheckbox
  v-model="formData.agree"
  label="ยอมรับเงื่อนไข"
  :required="true"
/>
```

#### 6. **BaseRadio** - Radio button
```vue
<BaseRadio
  v-model="formData.gender"
  label="เพศ"
  :options="genderOptions"
/>
```

#### 7. **BaseFileUpload** - File upload
```vue
<BaseFileUpload
  v-model="formData.file"
  label="อัปโหลดไฟล์"
  accept="image/*"
  :max-size="5"
  @upload="handleUpload"
/>
```

#### 8. **BaseDatePicker** - Date picker
```vue
<BaseDatePicker
  v-model="formData.date"
  label="วันที่"
  :required="true"
/>
```

#### 9. **BaseAutocomplete** - Autocomplete search
```vue
<BaseAutocomplete
  v-model="formData.search"
  :items="searchResults"
  label="ค้นหา"
  @search="handleSearch"
/>
```

#### 10. **BaseRichTextEditor** - WYSIWYG Editor
```vue
<BaseRichTextEditor
  v-model="formData.content"
  label="เนื้อหา"
/>
```

---

### Display Components

#### 11. **BaseIcon** - Icons จาก Heroicons
```vue
<BaseIcon
  name="academic-cap"  // Heroicon name (kebab-case)
  variant="outline"    // outline | solid | mini
  size="md"           // xs | sm | md | lg | xl | 2xl
  class="text-primary"
/>
```

**Icon sizes:**
- `xs`: w-3 h-3
- `sm`: w-4 h-4
- `md`: w-5 h-5 (default)
- `lg`: w-6 h-6
- `xl`: w-8 h-8
- `2xl`: w-10 h-10

**Common icons:**
- `academic-cap`, `arrow-right`, `check`, `check-circle`, `chevron-down`, `chevron-right`
- `document-text`, `home`, `pencil`, `plus`, `trash`, `user`, `x-mark`
- ดู Heroicons ทั้งหมดที่: https://heroicons.com

#### 12. **BaseAvatar** - User avatar
```vue
<BaseAvatar
  :src="user.avatar"
  :name="user.name"
  size="md"           // xs | sm | md | lg | xl
  :online="true"
/>
```

#### 13. **BaseAlert** - Alert messages
```vue
<BaseAlert
  type="success"      // info | success | warning | error
  title="สำเร็จ"
  message="บันทึกข้อมูลเรียบร้อย"
  :dismissible="true"
/>
```

#### 14. **BaseBadge** - Badge/Tag
```vue
<BaseBadge
  variant="primary"   // default | primary | secondary | accent | ghost
  size="md"          // xs | sm | md | lg
>
  New
</BaseBadge>
```

#### 15. **BaseBreadcrumbs** - Breadcrumb navigation
```vue
<BaseBreadcrumbs :items="breadcrumbItems" />
```

#### 16. **BaseLoading** - Loading spinner
```vue
<BaseLoading
  size="lg"          // xs | sm | md | lg | xl
  variant="spinner"  // spinner | dots | ring
/>
```

---

### Layout Components

#### 17. **BaseModal** - Modal dialog
```vue
<BaseModal
  v-model:visible="showModal"
  title="ยืนยันการลบ"
  size="md"          // xs | sm | md | lg | xl
  :closeable="true"
  :backdrop="true"
  :backdrop-close="true"
  @close="handleClose"
>
  <!-- Content -->
  <p>คุณต้องการลบข้อมูลนี้หรือไม่?</p>

  <!-- Actions slot -->
  <template #actions>
    <BaseButton variant="ghost" @click="showModal = false">
      ยกเลิก
    </BaseButton>
    <BaseButton variant="error" @click="handleDelete">
      ลบ
    </BaseButton>
  </template>
</BaseModal>
```

#### 18. **BaseTable** - Data table
```vue
<BaseTable
  :columns="columns"
  :data="items"
  :loading="isLoading"
  @row-click="handleRowClick"
/>
```

#### 19. **BaseDataTable** - Advanced data table with sorting, filtering
```vue
<BaseDataTable
  :columns="columns"
  :data="items"
  :total="total"
  :page="page"
  :limit="limit"
  :sortable="true"
  :filterable="true"
  @update:page="page = $event"
  @update:limit="limit = $event"
  @sort="handleSort"
/>
```

#### 20. **BasePagination** - Pagination controls
```vue
<BasePagination
  :page="page"
  :total="total"
  :limit="limit"
  @update:page="page = $event"
/>
```

#### 21. **BasePageHeader** - Page header with title and actions
```vue
<BasePageHeader
  title="จัดการห้องเรียน"
  :breadcrumbs="breadcrumbs"
>
  <template #actions>
    <BaseButton variant="primary" icon-left="plus" @click="handleCreate">
      เพิ่มห้องเรียน
    </BaseButton>
  </template>
</BasePageHeader>
```

---

### Utility Components

#### 22. **BaseConfirmContainer** - Confirmation dialog wrapper
```vue
<BaseConfirmContainer
  ref="confirm"
  @confirm="handleConfirm"
/>
```

#### 23. **BaseToastContainer** - Toast notifications container
```vue
<!-- ใน layout -->
<BaseToastContainer />

<!-- ใช้ใน component -->
<script setup>
const toast = useToast()
toast.success('บันทึกสำเร็จ')
toast.error('เกิดข้อผิดพลาด')
</script>
```

#### 24. **BaseGlobalAlert** - Global alert container
```vue
<!-- ใน layout -->
<BaseGlobalAlert />
```

#### 25. **BaseThemeToggle** - Dark/Light mode toggle
```vue
<BaseThemeToggle />
```

#### 26. **BaseLanguageSwitcher** - Language switcher
```vue
<BaseLanguageSwitcher />
```

---

## 🎨 การใช้งานตัวอย่าง

### Form Example
```vue
<template>
  <form @submit.prevent="handleSubmit">
    <BaseInput
      v-model="form.name"
      label="ชื่อ"
      :required="true"
      :error="errors.name"
      @update:error="errors.name = $event"
    />

    <BaseInput
      v-model="form.email"
      type="email"
      label="อีเมล"
      :required="true"
      :error="errors.email"
      @update:error="errors.email = $event"
    />

    <BaseTextarea
      v-model="form.description"
      label="คำอธิบาย"
      :rows="4"
    />

    <div class="flex gap-2">
      <BaseButton variant="ghost" @click="handleCancel">
        ยกเลิก
      </BaseButton>
      <BaseButton
        variant="primary"
        type="submit"
        :loading="isSubmitting"
        icon-left="check"
      >
        บันทึก
      </BaseButton>
    </div>
  </form>
</template>

<script setup lang="ts">
const form = reactive({
  name: '',
  email: '',
  description: ''
})

const errors = reactive({
  name: undefined,
  email: undefined
})

const isSubmitting = ref(false)

const handleSubmit = async () => {
  // Validate and submit
}
</script>
```

### Modal Example
```vue
<template>
  <div>
    <BaseButton @click="showModal = true">
      เปิด Modal
    </BaseButton>

    <BaseModal
      v-model:visible="showModal"
      title="แก้ไขข้อมูล"
      size="lg"
    >
      <!-- Form content -->
      <BaseInput v-model="data.name" label="ชื่อ" />

      <template #actions>
        <BaseButton variant="ghost" @click="showModal = false">
          ยกเลิก
        </BaseButton>
        <BaseButton variant="primary" @click="handleSave">
          บันทึก
        </BaseButton>
      </template>
    </BaseModal>
  </div>
</template>
```

### Table with Pagination Example
```vue
<template>
  <div>
    <BaseDataTable
      :columns="columns"
      :data="items"
      :loading="isLoading"
      :total="total"
      :page="page"
      :limit="limit"
      @update:page="page = $event"
      @update:limit="limit = $event"
      @sort="handleSort"
    />
  </div>
</template>

<script setup lang="ts">
const columns = [
  { key: 'name', label: 'ชื่อ', sortable: true },
  { key: 'code', label: 'รหัส', sortable: true },
  { key: 'status', label: 'สถานะ' }
]

const items = ref([])
const page = ref(1)
const limit = ref(10)
const total = ref(0)
const isLoading = ref(false)
</script>
```

---

## 💡 Best Practices

### 1. ใช้ Base Components เสมอ
```vue
<!-- ✅ GOOD -->
<BaseButton variant="primary">Click</BaseButton>
<BaseIcon name="check" size="md" />

<!-- ❌ BAD -->
<button class="btn btn-primary">Click</button>
<CheckIcon class="w-5 h-5" />
```

### 2. ใช้ Props แทน Classes
```vue
<!-- ✅ GOOD -->
<BaseButton variant="primary" size="lg" :loading="true" />

<!-- ❌ BAD -->
<button class="btn btn-primary btn-lg loading" />
```

### 3. ใช้ Icon Name แทน Component
```vue
<!-- ✅ GOOD -->
<BaseIcon name="academic-cap" />
<BaseButton icon-left="plus">เพิ่ม</BaseButton>

<!-- ❌ BAD -->
<AcademicCapIcon class="w-5 h-5" />
```

### 4. ใช้ v-model สำหรับ Form Inputs
```vue
<!-- ✅ GOOD -->
<BaseInput v-model="name" />

<!-- ❌ BAD -->
<input v-model="name" class="input" />
```

### 5. ใช้ Error Binding
```vue
<!-- ✅ GOOD -->
<BaseInput
  v-model="name"
  :error="errors.name"
  @update:error="errors.name = $event"
/>
```

---

## 📚 Related Documentation
- [UI Patterns](./UI_PATTERNS.md)
- [State Management](./STATE_MANAGEMENT.md)
- [Component Models](../composables/component_models/base.ts)
- [Form Models](../composables/component_models/form.ts)
