<template>
  <ClientOnly>
    <div class="min-h-screen bg-gradient-to-br from-primary/20 to-secondary/20 flex items-center justify-center p-4">
      <div class="card w-full max-w-md bg-base-100 shadow-2xl">
        <div class="card-body">
          <div class="text-center mb-8">
            <h1 class="text-3xl font-bold text-primary">Web Base</h1>
            <p class="text-base-content/70 mt-2">Web Base Admin Portal</p>
          </div>

          <slot />
        </div>
      </div>
    </div>
    </ClientOnly>
</template>

<script>
// This layout is used for authentication pages like login, register, etc.
</script>