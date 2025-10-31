<template>
  <div class="space-y-6">
    <!-- Page Header -->
    <BasePageHeader
      title="Components Showcase"
      code="COMP-001"
      description="Collection of reusable base components for consistent UI development"
      :breadcrumbs="[
        { label: 'Admin', to: '/admin', icon: 'home' },
        { label: 'Components', icon: 'puzzle-piece' }
      ]"
    >
      <template #actions>
        <div class="flex items-center gap-3">
          <BaseThemeToggle 
            variant="outline" 
            size="md" 
            shape="circle"
            @change="handleThemeChange"
          />
          <div class="badge badge-info badge-lg gap-2">
            <BaseIcon name="beaker" size="sm" />
            Demo Environment
          </div>
        </div>
      </template>
    </BasePageHeader>

    <!-- Component Summary -->
    <div class="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
      <div class="stat bg-base-100 shadow-md rounded-box p-4">
        <div class="stat-figure text-primary opacity-60">
          <BaseIcon name="cube" size="lg" />
        </div>
        <div class="stat-title text-xs">Base</div>
        <div class="stat-value text-2xl">4</div>
        <div class="stat-desc text-xs opacity-70 truncate">Icon, Button, Alert, Avatar</div>
      </div>
      <div class="stat bg-base-100 shadow-md rounded-box p-4">
        <div class="stat-figure text-secondary opacity-60">
          <BaseIcon name="clipboard-document" size="lg" />
        </div>
        <div class="stat-title text-xs">Form</div>
        <div class="stat-value text-2xl">7</div>
        <div class="stat-desc text-xs opacity-70 truncate">Input, Textarea, DatePicker, Checkbox, Radio, Select, Autocomplete</div>
      </div>
      <div class="stat bg-base-100 shadow-md rounded-box p-4">
        <div class="stat-figure text-accent opacity-60">
          <BaseIcon name="squares-2x2" size="lg" />
        </div>
        <div class="stat-title text-xs">Layout</div>
        <div class="stat-value text-2xl">5</div>
        <div class="stat-desc text-xs opacity-70 truncate">PageHeader, Modal, Loading, Breadcrumbs, ThemeToggle</div>
      </div>
      <div class="stat bg-base-100 shadow-md rounded-box p-4">
        <div class="stat-figure text-info opacity-60">
          <BaseIcon name="table-cells" size="lg" />
        </div>
        <div class="stat-title text-xs">Data</div>
        <div class="stat-value text-2xl">3</div>
        <div class="stat-desc text-xs opacity-70 truncate">Table, DataTable, Pagination</div>
      </div>
    </div>

    <!-- Tabs Navigation -->
    <div role="tablist" class="tabs bg-base-300 rounded-lg p-1 mb-6">
      <a 
        role="tab"
        class="tab rounded-md"
        :class="{ 
          'tab-active bg-base-100 shadow-sm': activeTab === 'guidelines',
          'hover:bg-base-200': activeTab !== 'guidelines'
        }"
        @click="activeTab = 'guidelines'"
      >
        <BaseIcon name="light-bulb" size="sm" class="mr-2" />
        Developer Guidelines
      </a>
      <a 
        role="tab"
        class="tab rounded-md"
        :class="{ 
          'tab-active bg-base-100 shadow-sm': activeTab === 'base',
          'hover:bg-base-200': activeTab !== 'base'
        }"
        @click="activeTab = 'base'"
      >
        <BaseIcon name="cube" size="sm" class="mr-2" />
        Base Components
      </a>
      <a 
        role="tab"
        class="tab rounded-md"
        :class="{ 
          'tab-active bg-base-100 shadow-sm': activeTab === 'form',
          'hover:bg-base-200': activeTab !== 'form'
        }"
        @click="activeTab = 'form'"
      >
        <BaseIcon name="clipboard-document" size="sm" class="mr-2" />
        Form Components
      </a>
      <a 
        role="tab"
        class="tab rounded-md"
        :class="{ 
          'tab-active bg-base-100 shadow-sm': activeTab === 'layout',
          'hover:bg-base-200': activeTab !== 'layout'
        }"
        @click="activeTab = 'layout'"
      >
        <BaseIcon name="squares-2x2" size="sm" class="mr-2" />
        Layout Components
      </a>
      <a 
        role="tab"
        class="tab rounded-md"
        :class="{ 
          'tab-active bg-base-100 shadow-sm': activeTab === 'data',
          'hover:bg-base-200': activeTab !== 'data'
        }"
        @click="activeTab = 'data'"
      >
        <BaseIcon name="table-cells" size="sm" class="mr-2" />
        Data Components
      </a>
    </div>

    <!-- Tab Content -->
    <div class="min-h-[600px]">
      <!-- Developer Guidelines Tab -->
      <div v-if="activeTab === 'guidelines'" class="space-y-6">
        <!-- Development Guidelines -->
        <div class="card bg-base-100 shadow-xl">
          <div class="card-body">
            <h2 class="card-title flex items-center gap-2">
              <BaseIcon name="light-bulb" size="md" />
              Development Guidelines
            </h2>
            <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <h3 class="font-semibold mb-3 flex items-center gap-2">
                  <BaseIcon name="check-circle" size="sm" />
                  Best Practices
                </h3>
                <ul class="space-y-2 text-sm">
                  <li><strong>Consistency</strong>: All components follow DaisyUI design patterns</li>
                  <li><strong>Reusability</strong>: Components are generic and configurable</li>
                  <li><strong>Documentation</strong>: Each component has usage examples and prop documentation</li>
                  <li><strong>Icons</strong>: Always use BaseIcon component instead of raw SVG or emoji</li>
                  <li><strong>Responsiveness</strong>: Components work across all screen sizes</li>
                </ul>
              </div>
              <div>
                <h3 class="font-semibold mb-3 flex items-center gap-2">
                  <BaseIcon name="information-circle" size="sm" />
                  Component Status
                </h3>
                <div class="space-y-2">
                  <div class="flex items-center gap-2">
                    <div class="badge badge-success badge-sm">Production Ready</div>
                    <span class="text-sm">All base components are tested and documented</span>
                  </div>
                  <div class="flex items-center gap-2">
                    <div class="badge badge-info badge-sm">Thai Localized</div>
                    <span class="text-sm">Full Thai language and Buddhist Era support</span>
                  </div>
                  <div class="flex items-center gap-2">
                    <div class="badge badge-primary badge-sm">TypeScript</div>
                    <span class="text-sm">Complete type safety and IntelliSense support</span>
                  </div>
                  <div class="flex items-center gap-2">
                    <div class="badge badge-secondary badge-sm">Auto Import</div>
                    <span class="text-sm">All components are auto-imported in Nuxt</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- State Management Guide -->
        <div class="card bg-base-100 shadow-xl">
          <div class="card-body">
            <h2 class="card-title flex items-center gap-2">
              <BaseIcon name="cpu-chip" size="md" />
              State Management Patterns
            </h2>
            <div class="space-y-6">
              <!-- Overview -->
              <div class="alert">
                <BaseIcon name="information-circle" />
                <div>
                  <h3 class="font-bold">State Subscription Methods</h3>
                  <div class="text-sm">เลือกวิธี subscribe state changes ให้เหมาะสมกับ use case</div>
                </div>
              </div>

              <!-- Methods Grid -->
              <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <!-- Computed -->
                <div class="card bg-base-200 shadow-sm">
                  <div class="card-body p-4">
                    <h3 class="card-title text-sm">
                      <div class="badge badge-primary badge-sm">computed</div>
                      Derived Values
                    </h3>
                    <div class="text-xs space-y-2">
                      <p><strong>ใช้เมื่อ:</strong> ต้องการค่าที่คำนวณจาก state</p>
                      <div class="mockup-code text-xs">
                        <pre><code>const userInfo = computed(() => {
  return `${user.firstName} ${user.lastName}`
})</code></pre>
                      </div>
                    </div>
                  </div>
                </div>

                <!-- Watch -->
                <div class="card bg-base-200 shadow-sm">
                  <div class="card-body p-4">
                    <h3 class="card-title text-sm">
                      <div class="badge badge-secondary badge-sm">watch</div>
                      Side Effects
                    </h3>
                    <div class="text-xs space-y-2">
                      <p><strong>ใช้เมื่อ:</strong> ต้องทำ action เมื่อ state เปลี่ยน</p>
                      <div class="mockup-code text-xs">
                        <pre><code>watch(() => auth.isAuthenticated, (isAuth) => {
  if (!isAuth) navigateTo('/login')
})</code></pre>
                      </div>
                    </div>
                  </div>
                </div>

                <!-- $subscribe -->
                <div class="card bg-base-200 shadow-sm">
                  <div class="card-body p-4">
                    <h3 class="card-title text-sm">
                      <div class="badge badge-accent badge-sm">$subscribe</div>
                      Store Changes
                    </h3>
                    <div class="text-xs space-y-2">
                      <p><strong>ใช้เมื่อ:</strong> ต้อง track ทุกการเปลี่ยนแปลงใน store</p>
                      <div class="mockup-code text-xs">
                        <pre><code>store.$subscribe((mutation, state) => {
  localStorage.setItem('state', JSON.stringify(state))
})</code></pre>
                      </div>
                    </div>
                  </div>
                </div>

                <!-- watchEffect -->
                <div class="card bg-base-200 shadow-sm">
                  <div class="card-body p-4">
                    <h3 class="card-title text-sm">
                      <div class="badge badge-warning badge-sm">watchEffect</div>
                      Auto Dependencies
                    </h3>
                    <div class="text-xs space-y-2">
                      <p><strong>ใช้เมื่อ:</strong> ต้อง track หลาย dependencies อัตโนมัติ</p>
                      <div class="mockup-code text-xs">
                        <pre><code>watchEffect(() => {
  document.title = `${user.name} - ${currentPage}`
})</code></pre>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <!-- Recommendations -->
              <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <h3 class="font-semibold mb-3 flex items-center gap-2">
                    <BaseIcon name="star" size="sm" />
                    แนะนำการใช้งาน
                  </h3>
                  <div class="space-y-2 text-sm">
                    <div class="flex items-start gap-2">
                      <div class="badge badge-primary badge-xs mt-1">computed</div>
                      <span>UI display values, formatting, การคำนวณ</span>
                    </div>
                    <div class="flex items-start gap-2">
                      <div class="badge badge-secondary badge-xs mt-1">watch</div>
                      <span>Navigation, API calls, validation</span>
                    </div>
                    <div class="flex items-start gap-2">
                      <div class="badge badge-accent badge-xs mt-1">$subscribe</div>
                      <span>State persistence, logging, analytics</span>
                    </div>
                    <div class="flex items-start gap-2">
                      <div class="badge badge-warning badge-xs mt-1">watchEffect</div>
                      <span>DOM manipulation, complex dependencies</span>
                    </div>
                  </div>
                </div>
                <div>
                  <h3 class="font-semibold mb-3 flex items-center gap-2">
                    <BaseIcon name="light-bulb" size="sm" />
                    Best Practices
                  </h3>
                  <ul class="space-y-2 text-sm">
                    <li><strong>Performance</strong>: ใช้ computed สำหรับ derived values</li>
                    <li><strong>Cleanup</strong>: ใส่ watchers ใน onMounted/onBeforeUnmount</li>
                    <li><strong>Deep Watch</strong>: ระวังการใช้ { deep: true } กับ objects ใหญ่</li>
                    <li><strong>Immediate</strong>: ใช้ { immediate: true } เมื่อต้องการ trigger ทันที</li>
                    <li><strong>Memory</strong>: ตรวจสอบ memory leaks จาก watchers</li>
                  </ul>
                </div>
              </div>

              <!-- Summary -->
              <div class="alert alert-success">
                <BaseIcon name="check-circle" />
                <div>
                  <h3 class="font-bold">🎯 สรุป</h3>
                  <div class="text-sm space-y-1">
                    <p>• <strong>computed</strong> → Reactive values ที่คำนวณจาก state อื่น</p>
                    <p>• <strong>watch</strong> → Side effects เมื่อ specific state เปลี่ยน</p>
                    <p>• <strong>$subscribe</strong> → Track ทุกการเปลี่ยนแปลงใน Pinia store</p>
                    <p>• <strong>watchEffect</strong> → Auto-track dependencies สำหรับ complex logic</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Base Components Tab -->
      <ShowcaseBaseComponentsTab
        v-if="activeTab === 'base'"
        :alert-demo="alertDemo"
      />

      <!-- Form Components Tab -->
      <ShowcaseFormComponentsTab
        v-if="activeTab === 'form'"
        :input-demo="inputDemo"
        :textarea-demo="textareaDemo"
        :date-demo="dateDemo"
        :checkbox-demo="checkboxDemo"
        :radio-demo="radioDemo"
        :select-demo="selectDemo"
        :select-options="selectOptions"
        :autocomplete-demo="autocompleteDemo"
        :autocomplete-options="autocompleteOptions"
      />

      <!-- Layout Components Tab -->
      <ShowcaseLayoutComponentsTab
        v-if="activeTab === 'layout'"
        :modal-demo="modalDemo"
        :show-loading-demo="showLoadingDemo"
      />

      <!-- Data Components Tab -->
      <ShowcaseDataComponentsTab
        v-if="activeTab === 'data'"
        :table-demo="tableDemo"
        :data-table-demo="dataTableDemo"
        :data-table-data="dataTableData"
        :data-table-fields="dataTableFields"
        :pagination-demo="paginationDemo"
        :handle-table-sort="handleTableSort"
        :handle-table-edit="handleTableEdit"
        :handle-table-delete="handleTableDelete"
      />
    </div>


  </div>
  
  <!-- Demo Modals -->
  <BaseModal v-model:visible="modalDemo.basic" title="Basic Modal" size="md">
    <p>This is a basic modal with title and content.</p>
    <p>Click outside or press ESC to close.</p>
  </BaseModal>

  <BaseModal v-model:visible="modalDemo.form" title="Form Modal" size="lg">
    <form @submit.prevent="saveModalForm">
      <div class="space-y-4">
        <BaseInput v-model="modalDemo.formData.name" label="Name" required />
        <BaseInput v-model="modalDemo.formData.email" type="email" label="Email" required />
        <BaseInput v-model="modalDemo.formData.phone" type="tel" label="Phone" />
      </div>
    </form>
    
    <template #actions>
      <BaseButton @click="modalDemo.form = false">Cancel</BaseButton>
      <BaseButton type="submit" variant="primary" @click="saveModalForm">Save</BaseButton>
    </template>
  </BaseModal>

  <BaseModal v-model:visible="modalDemo.small" title="Small Modal" size="sm">
    <p>This is a small sized modal.</p>
  </BaseModal>

  <BaseModal v-model:visible="modalDemo.large" title="Large Modal" size="xl">
    <p>This is a large sized modal with more content space.</p>
    <p>Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.</p>
  </BaseModal>

  <BaseModal v-model:visible="modalDemo.force" title="Confirm Action" :closeable="false" :backdrop-close="false">
    <p>This modal cannot be closed by clicking outside or pressing ESC.</p>
    <p>You must choose an action to proceed.</p>
    
    <template #actions>
      <BaseButton variant="error" @click="modalDemo.force = false">Cancel</BaseButton>
      <BaseButton variant="success" @click="confirmForceAction">Confirm</BaseButton>
    </template>
  </BaseModal>

  <BaseModal v-model:visible="modalDemo.showBasic" title="Basic Demo Modal" size="md">
    <p>This is a basic modal demonstration.</p>
  </BaseModal>

  <BaseModal v-model:visible="modalDemo.showLarge" title="Large Demo Modal" size="xl">
    <p>This is a large modal demonstration with more content space.</p>
  </BaseModal>

  <BaseModal v-model:visible="modalDemo.showWithActions" title="Modal with Actions">
    <p>This modal demonstrates the actions slot.</p>
    <template #actions>
      <BaseButton @click="modalDemo.showWithActions = false">Close</BaseButton>
      <BaseButton variant="primary">Save Changes</BaseButton>
    </template>
  </BaseModal>

  <!-- Alert Components -->
  <BaseAlert v-model:visible="alertDemo.showSuccess" type="success" title="สำเร็จ!"
    message="บันทึกข้อมูลเรียบร้อยแล้ว" position="top" :duration="3000" />
  
  <BaseAlert v-model:visible="alertDemo.showError" type="error" title="เกิดข้อผิดพลาด!"
    message="ไม่สามารถบันทึกข้อมูลได้" position="top" :duration="4000" />
  
  <BaseAlert v-model:visible="alertDemo.showWarning" type="warning" title="คำเตือน!"
    message="กรุณาตรวจสอบข้อมูลก่อนบันทึก" position="top" :duration="4000" />
  
  <BaseAlert v-model:visible="alertDemo.showConfirm" type="confirm" title="ยืนยันการลบ"
    message="คุณต้องการลบรายการนี้หรือไม่?" position="center" @confirm="handleConfirm" @cancel="handleCancel" />
</template>

<script setup>
import { ref, onMounted } from 'vue'

definePageMeta({
  layout: 'default',
  middleware: 'auth'
})

// Active tab state
const activeTab = ref('guidelines')

// Demo data for form components
const inputDemo = ref({
  text: '',
  email: '',
  number: '',
  password: '',
  primary: '',
  success: '',
  warning: '',
  error: ''
})

const dateDemo = ref({
  date: '',
  time: '',
  datetime: ''
})

const checkboxDemo = ref({
  basic: false,
  required: false,
  disabled: false,
  primary: false,
  success: false,
  warning: false,
  error: false,
  indeterminate: false
})

const radioDemo = ref({
  size: 'medium',
  color: 'blue'
})

const textareaDemo = ref({
  basic: '',
  required: '',
  help: '',
  error: '',
  primary: '',
  success: '',
  large: '',
  readonly: ''
})

const tableDemo = ref({
  loading: false,
  users: [
    { id: 1, name: 'John Doe', email: 'john@example.com', status: 'Active' },
    { id: 2, name: 'Jane Smith', email: 'jane@example.com', status: 'Inactive' },
    { id: 3, name: 'Bob Johnson', email: 'bob@example.com', status: 'Active' }
  ],
  columns: [
    { key: 'name', label: 'Name', sortable: true },
    { key: 'email', label: 'Email', sortable: true },
    { key: 'status', label: 'Status' }
  ]
})

// Demo data for utility examples
const mounted = ref(false)

// Demo data for select components
const selectDemo = ref({
  basic: null,
  sizes: null,
  variant: null,
  disabled: 'opt1'
})

const selectOptions = [
  { label: 'Option 1', value: 'opt1' },
  { label: 'Option 2', value: 'opt2' },
  { label: 'Option 3', value: 'opt3' }
]

const autocompleteDemo = ref({
  basic: null,
  basicDisplay: '',
  api: null,
  apiDisplay: '',
  custom: null,
  customDisplay: '',
  readonly: null,
  readonlyDisplay: ''
})

const autocompleteOptions = [
  { label: 'Apple', value: 'apple', id: 1, name: 'Apple' },
  { label: 'Banana', value: 'banana', id: 2, name: 'Banana' },
  { label: 'Cherry', value: 'cherry', id: 3, name: 'Cherry' },
  { label: 'Orange', value: 'orange', id: 4, name: 'Orange' }
]

// Pagination demo
const paginationDemo = ref({
  currentPage: 3
})

// Alert demo data
const alertDemo = ref({
  showSuccess: false,
  showError: false,
  showWarning: false,
  showInfo: false,
  showConfirm: false,
  confirmResult: ''
})

const handleConfirm = () => {
  alertDemo.value.confirmResult = 'ผู้ใช้กดยืนยัน'
}

const handleCancel = () => {
  alertDemo.value.confirmResult = 'ผู้ใช้กดยกเลิก'
}

// Modal demo data
const modalDemo = ref({
  basic: false,
  form: false,
  small: false,
  large: false,
  force: false,
  showBasic: false,
  showLarge: false,
  showWithActions: false,
  formData: {
    name: '',
    email: '',
    phone: ''
  }
})

const saveModalForm = () => {
  // Simulate saving
  alert(`Saved: ${modalDemo.value.formData.name} - ${modalDemo.value.formData.email}`)
  modalDemo.value.form = false
  modalDemo.value.showWithActions = false
  // Reset form
  modalDemo.value.formData = { name: '', email: '', phone: '' }
}

const confirmForceAction = () => {
  alert('Action confirmed!')
  modalDemo.value.force = false
}

// DataTable demo data
const dataTableDemo = ref({
  selectedRows: []
})

// DataTable fields configuration
const dataTableFields = ref([
  {
    key: 'id',
    label: 'ID',
    type: 'number',
    width: '80px',
    align: 'center'
  },
  {
    key: 'name',
    label: 'ชื่อ',
    sortable: true
  },
  {
    key: 'email',
    label: 'อีเมล',
    sortable: true
  },
  {
    key: 'status',
    label: 'สถานะ',
    align: 'center',
    formatter: (value) => {
      const statusMap = {
        active: '<span class="badge badge-success badge-sm">เปิดใช้งาน</span>',
        inactive: '<span class="badge badge-error badge-sm">ปิดใช้งาน</span>',
        pending: '<span class="badge badge-warning badge-sm">รอดำเนินการ</span>'
      }
      return statusMap[value] || value
    }
  },
  {
    key: 'createdAt',
    label: 'วันที่สร้าง',
    type: 'date',
    align: 'center'
  },
  {
    key: 'actions',
    label: 'จัดการ',
    align: 'center',
    formatter: () => `
      <div class="flex gap-1 justify-center">
        <button class="btn btn-ghost btn-xs text-info">
<BaseIcon name="pencil" size="sm" />
        </button>
        <button class="btn btn-ghost btn-xs text-error">
<BaseIcon name="trash" size="sm" />
        </button>
      </div>
    `
  }
])

// DataTable data with nested children
const dataTableData = ref([
  {
    id: 1,
    name: 'สมชาย ใจดี',
    email: 'somchai@example.com',
    status: 'active',
    createdAt: '2024-01-15',
    children: [
      {
        id: 11,
        name: 'โปรไฟล์ผู้ใช้',
        email: 'profile@example.com',
        status: 'active',
        createdAt: '2024-01-16'
      },
      {
        id: 12,
        name: 'การตั้งค่า',
        email: 'settings@example.com',
        status: 'pending',
        createdAt: '2024-01-17'
      }
    ]
  },
  {
    id: 2,
    name: 'สมหญิง รักสุข',
    email: 'somying@example.com',
    status: 'inactive',
    createdAt: '2024-01-20',
    children: [
      {
        id: 21,
        name: 'ข้อมูลส่วนตัว',
        email: 'personal@example.com',
        status: 'inactive',
        createdAt: '2024-01-21'
      }
    ]
  },
  {
    id: 3,
    name: 'วิชาญ เก่งมาก',
    email: 'wichan@example.com',
    status: 'pending',
    createdAt: '2024-02-01'
  },
  {
    id: 4,
    name: 'มาลี สวยงาม',
    email: 'malee@example.com',
    status: 'active',
    createdAt: '2024-02-05',
    children: [
      {
        id: 41,
        name: 'บัญชีผู้ใช้',
        email: 'account@example.com',
        status: 'active',
        createdAt: '2024-02-06'
      },
      {
        id: 42,
        name: 'ประวัติการใช้งาน',
        email: 'history@example.com',
        status: 'active',
        createdAt: '2024-02-07'
      },
      {
        id: 43,
        name: 'การแจ้งเตือน',
        email: 'notification@example.com',
        status: 'pending',
        createdAt: '2024-02-08'
      }
    ]
  }
])

// Loading demo
const { show: showLoading, hide: hideLoading } = useLoading()

const demoLoading = (type) => {
  switch (type) {
    case 'basic':
      showLoading()
      setTimeout(hideLoading, 3000)
      break
    case 'custom-message':
      showLoading('กำลังบันทึกข้อมูล...')
      setTimeout(hideLoading, 3000)
      break
    case 'dots':
      showLoading('กำลังประมวลผล...', { spinner: 'dots', size: 'lg' })
      setTimeout(hideLoading, 3000)
      break
    case 'ring':
      showLoading('กำลังอัพโหลด...', { spinner: 'ring', size: 'md' })
      setTimeout(hideLoading, 3000)
      break
  }
}

// Demo functions for new components
const showLoadingDemo = (type) => {
  demoLoading(type)
}

const handleTableSort = (key, order) => {
  console.log(`Sorting by ${key} in ${order} order`)
}

const handleTableEdit = (row) => {
  alert(`Editing user: ${row.name}`)
}

const handleTableDelete = (row, index) => {
  if (confirm(`Delete user: ${row.name}?`)) {
    tableDemo.value.users.splice(index, 1)
  }
}

// Theme handling
const handleThemeChange = (theme) => {
  console.log('Theme changed to:', theme)
}

onMounted(() => {
  mounted.value = true
})
</script>