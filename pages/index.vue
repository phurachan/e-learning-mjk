<template>
  <div class="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-500 via-purple-500 to-pink-500">
    <div class="container mx-auto px-4">
      <!-- Main Card -->
      <div class="max-w-4xl mx-auto">
        <!-- Logo & Title -->
        <div class="text-center mb-12">
          <h1 class="text-5xl md:text-6xl font-bold text-white mb-4 drop-shadow-lg">
            E-Learning MJK
          </h1>
          <p class="text-xl md:text-2xl text-white/90">
            ระบบจัดการการเรียนการสอนออนไลน์
          </p>
        </div>

        <!-- Login Options Card -->
        <div class="card bg-base-100 shadow-2xl">
          <div class="card-body p-8 md:p-12">
            <h2 class="card-title text-3xl font-bold text-center justify-center mb-8">
              เลือกประเภทผู้ใช้งาน
            </h2>

            <!-- Login Buttons Grid -->
            <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
              <!-- Student Login Card -->
              <NuxtLink
                to="/student/login"
                class="group relative overflow-hidden rounded-2xl bg-gradient-to-br from-blue-500 to-blue-600 p-8 text-white transition-all hover:shadow-2xl hover:scale-105"
              >
                <div class="relative z-10">
                  <div class="flex justify-center mb-4">
                    <BaseIcon name="academic-cap" class="w-20 h-20" />
                  </div>
                  <h3 class="text-2xl font-bold text-center mb-2">นักเรียน</h3>
                  <p class="text-center text-white/90 mb-4">
                    เข้าสู่ระบบสำหรับนักเรียน
                  </p>
                  <div class="flex items-center justify-center gap-2 text-sm font-semibold">
                    <span>เข้าสู่ระบบ</span>
                    <BaseIcon name="arrow-right" class="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                  </div>
                </div>
                <!-- Animated Background -->
                <div class="absolute inset-0 bg-gradient-to-br from-blue-400 to-blue-700 opacity-0 group-hover:opacity-100 transition-opacity"></div>
              </NuxtLink>

              <!-- Teacher/Admin Login Card -->
              <NuxtLink
                to="/login"
                class="group relative overflow-hidden rounded-2xl bg-gradient-to-br from-pink-500 to-pink-600 p-8 text-white transition-all hover:shadow-2xl hover:scale-105"
              >
                <div class="relative z-10">
                  <div class="flex justify-center mb-4">
                    <BaseIcon name="user-group" class="w-20 h-20" />
                  </div>
                  <h3 class="text-2xl font-bold text-center mb-2">ครู / ผู้ดูแลระบบ</h3>
                  <p class="text-center text-white/90 mb-4">
                    เข้าสู่ระบบสำหรับครูและผู้ดูแล
                  </p>
                  <div class="flex items-center justify-center gap-2 text-sm font-semibold">
                    <span>เข้าสู่ระบบ</span>
                    <BaseIcon name="arrow-right" class="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                  </div>
                </div>
                <!-- Animated Background -->
                <div class="absolute inset-0 bg-gradient-to-br from-pink-400 to-pink-700 opacity-0 group-hover:opacity-100 transition-opacity"></div>
              </NuxtLink>
            </div>

            <!-- Additional Info -->
            <div class="mt-8 text-center text-sm text-base-content/60">
              <p>หากมีปัญหาในการเข้าสู่ระบบ กรุณาติดต่อผู้ดูแลระบบ</p>
            </div>
          </div>
        </div>

        <!-- Footer -->
        <div class="text-center mt-8 text-white/80 text-sm">
          <p>&copy; 2025 E-Learning MJK. All rights reserved.</p>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
definePageMeta({
  layout: false,
})
</script>
