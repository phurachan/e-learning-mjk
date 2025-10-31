<template>
  <div>
    <div class="container mx-auto px-4 py-2 min-h-screen">
      <!-- Page Header -->
      <BasePageHeader
        title="จัดการผู้ใช้"
        code="USER-001"
        description="จัดการบทบาท สิทธิ์ และการเข้าถึงของผู้ใช้"
        :breadcrumbs="[
          { label: 'Admin', to: '/admin', icon: 'home' },
          { label: 'จัดการผู้ใช้', icon: 'user-group' }
        ]"
      />
      
      <!-- Tab Navigation -->
      <div role="tablist" class="tabs bg-base-300 rounded-lg p-1 mb-6">
        <a 
          role="tab"
          class="tab rounded-md"
          :class="{ 
            'tab-active bg-base-100 shadow-sm': activeTab === 'users',
            'hover:bg-base-200': activeTab !== 'users'
          }" 
          @click="activeTab = 'users'"
        >
          <BaseIcon name="user" size="sm" class="mr-2" />
          ผู้ใช้
        </a>
        
        <a 
          role="tab"
          class="tab rounded-md"
          :class="{ 
            'tab-active bg-base-100 shadow-sm': activeTab === 'roles',
            'hover:bg-base-200': activeTab !== 'roles'
          }" 
          @click="activeTab = 'roles'"
        >
          <BaseIcon name="users" size="sm" class="mr-2" />
          บทบาท
        </a>
        
        <a 
          role="tab"
          class="tab rounded-md"
          :class="{ 
            'tab-active bg-base-100 shadow-sm': activeTab === 'permissions',
            'hover:bg-base-200': activeTab !== 'permissions'
          }" 
          @click="activeTab = 'permissions'"
        >
          <BaseIcon name="lock-closed" size="sm" class="mr-2" />
          สิทธิ์
        </a>
      </div>

      <!-- Users Tab -->
      <div v-if="activeTab === 'users'" class="space-y-6">
        <UserManagementUsersTab />
      </div>

      <!-- Roles Tab -->
      <div v-if="activeTab === 'roles'" class="space-y-6">
        <UserManagementRolesTab />
      </div>

      <!-- Permissions Tab -->
      <div v-if="activeTab === 'permissions'" class="space-y-6">
        <UserManagementPermissionsTab />
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">

definePageMeta({
  layout: 'default',
  middleware: 'auth'
})

// Reactive data
const activeTab = ref('users')

// Set page title
useHead({
  title: 'จัดการผู้ใช้ - Admin Panel'
})
</script>