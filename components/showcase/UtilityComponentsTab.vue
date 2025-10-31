<template>
  <div class="space-y-8">
    <!-- usePathMapping Composable -->
    <div class="card bg-base-100 shadow-xl">
      <div class="card-body">
        <div class="alert alert-info">
          <BaseIcon name="information-circle" size="md" />
          <div>
            <h3 class="font-semibold">usePathMapping Composable</h3>
            <p class="text-sm">Path mapping utilities for breadcrumb generation and URL-to-label conversion with Thai support.</p>
          </div>
        </div>

        <!-- Available Functions -->
        <div class="bg-base-200 rounded-lg p-4">
          <h3 class="font-semibold mb-3 flex items-center gap-2">
            <BaseIcon name="cpu-chip" size="sm" />
            Available Functions
          </h3>
          <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div class="space-y-3">
              <div>
                <code class="text-sm font-medium">initializePathMapping()</code>
                <p class="text-xs text-base-content/70 mt-1">Initialize path mapping from router if not already done</p>
              </div>
              <div>
                <code class="text-sm font-medium">getFormattedLabel(segment: string)</code>
                <p class="text-xs text-base-content/70 mt-1">Convert path segment to readable label (kebab-case → Title Case)</p>
              </div>
              <div>
                <code class="text-sm font-medium">getPathMapping(path: string)</code>
                <p class="text-xs text-base-content/70 mt-1">Get mapping object for specific path</p>
              </div>
            </div>
            <div class="space-y-3">
              <div>
                <code class="text-sm font-medium">setCustomLabel(path: string, label: string)</code>
                <p class="text-xs text-base-content/70 mt-1">Manually set custom label for a path</p>
              </div>
              <div>
                <code class="text-sm font-medium">resetPathMapping()</code>
                <p class="text-xs text-base-content/70 mt-1">Reset and regenerate all path mappings</p>
              </div>
              <div>
                <code class="text-sm font-medium">getAllMappings()</code>
                <p class="text-xs text-base-content/70 mt-1">Get complete mapping object</p>
              </div>
            </div>
          </div>
        </div>

        <!-- Usage Examples -->
        <div class="bg-base-200 rounded-lg p-4">
          <h3 class="font-semibold mb-3 flex items-center gap-2">
            <BaseIcon name="beaker" size="sm" />
            Example Usage
          </h3>
          <div class="mockup-code text-sm">
            <pre data-prefix="1"><code>// Format a path segment</code></pre>
            <pre data-prefix="2"><code>const label = getFormattedLabel('user-management')</code></pre>
            <pre data-prefix="3"><code>// Result: "User Management"</code></pre>
            <pre data-prefix="4"><code></code></pre>
            <pre data-prefix="5"><code>// Set custom label for a path</code></pre>
            <pre data-prefix="6"><code>setCustomLabel('/admin/user_management', 'System Settings')</code></pre>
            <pre data-prefix="7"><code></code></pre>
            <pre data-prefix="8"><code>// Get mapping for breadcrumb generation</code></pre>
            <pre data-prefix="9"><code>const mapping = getPathMapping('/admin/users')</code></pre>
            <pre data-prefix="10"><code>// Result: { label: "Users", children: {...} }</code></pre>
          </div>
        </div>

        <!-- Props & Returns Documentation -->
        <div class="bg-base-200 rounded-lg p-4">
          <h3 class="font-semibold mb-3 flex items-center gap-2">
            <BaseIcon name="adjustments-horizontal" size="sm" />
            Returns & Features
          </h3>
          <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <p class="font-medium text-sm mb-2">Returned Functions:</p>
              <div class="text-xs space-y-1">
                <div><code>initializePathMapping: () => void</code></div>
                <div><code>getFormattedLabel: (segment: string) => string</code></div>
                <div><code>getPathMapping: (path: string) => PathMappingNode | null</code></div>
                <div><code>setCustomLabel: (path: string, label: string) => void</code></div>
                <div><code>resetPathMapping: () => void</code></div>
                <div><code>getAllMappings: () => Record&lt;string, PathMappingNode&gt;</code></div>
                <div><code>isGenerated: ComputedRef&lt;boolean&gt;</code></div>
              </div>
            </div>
            <div>
              <p class="font-medium text-sm mb-2">Features:</p>
              <div class="text-xs space-y-1">
                <div>🔄 Auto-generation from Nuxt router</div>
                <div>💾 Persistent storage (localStorage)</div>
                <div>🎯 Manual label override support</div>
                <div>🏗️ Nested path structure support</div>
                <div>⚡ Reactive computed properties</div>
                <div>🔧 Reset and regenerate functionality</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- useFormatDate Utility -->
    <div class="card bg-base-100 shadow-xl">
      <div class="card-body">
        <div class="alert alert-info">
          <BaseIcon name="information-circle" size="md" />
          <div>
            <h3 class="font-semibold">useFormatDate Composable</h3>
            <p class="text-sm">Thai Buddhist Era date formatting with conversion utilities and multiple format options.</p>
          </div>
        </div>

        <!-- Date Formatting Examples -->
        <div class="bg-base-200 rounded-lg p-4">
          <h3 class="font-semibold mb-3 flex items-center gap-2">
            <BaseIcon name="calendar-days" size="sm" />
            Date Formatting Functions
          </h3>
          <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <p class="font-medium text-sm mb-2">Main Functions:</p>
              <div class="text-xs space-y-1">
                <div><code>dateToThai(date, options?)</code> - Convert to Thai format</div>
                <div><code>dateFromThai(thaiString)</code> - Parse Thai date</div>
                <div><code>getCurrentThaiDate(options?)</code> - Current Thai date</div>
                <div><code>buddhistToGregorian(year)</code> - BE to AD year</div>
                <div><code>gregorianToBuddhist(year)</code> - AD to BE year</div>
              </div>
            </div>
            <div>
              <p class="font-medium text-sm mb-2">Usage Examples:</p>
              <div class="text-xs space-y-1">
                <div><code>dateToThai(new Date())</code> → "6 ก.ย. 2568"</div>
                <div><code>dateToThai(date, {format: 'full'})</code></div>
                <div><code>dateToThai(date)</code> (in template)</div>
              </div>
            </div>
          </div>
        </div>

        <!-- Format Options -->
        <div class="bg-base-200 rounded-lg p-4">
          <h3 class="font-semibold mb-3 flex items-center gap-2">
            <BaseIcon name="adjustments-horizontal" size="sm" />
            Format Options
          </h3>
          <div class="mockup-code text-sm">
            <pre data-prefix="1"><code>// Short format: 6/9/2568</code></pre>
            <pre data-prefix="2"><code>dateToThai(date, { format: 'short' })</code></pre>
            <pre data-prefix="3"><code></code></pre>
            <pre data-prefix="4"><code>// Medium format: 6 ก.ย. 2568</code></pre>
            <pre data-prefix="5"><code>dateToThai(date, { format: 'medium' })</code></pre>
            <pre data-prefix="6"><code></code></pre>
            <pre data-prefix="7"><code>// Long format: 6 กันยายน พ.ศ. 2568</code></pre>
            <pre data-prefix="8"><code>dateToThai(date, { format: 'long' })</code></pre>
            <pre data-prefix="9"><code></code></pre>
            <pre data-prefix="10"><code>// With time: 6 ก.ย. 2568 เวลา 14:30 น.</code></pre>
            <pre data-prefix="11"><code>dateToThai(date, { includeTime: true })</code></pre>
          </div>
        </div>
      </div>
    </div>

    <!-- useFormatNumber Utility -->
    <div class="card bg-base-100 shadow-xl">
      <div class="card-body">
        <div class="alert alert-info">
          <BaseIcon name="information-circle" size="md" />
          <div>
            <h3 class="font-semibold">useFormatNumber Composable</h3>
            <p class="text-sm">Thai numeral conversion, currency formatting, and comprehensive number utilities.</p>
          </div>
        </div>

        <!-- Number Formatting Examples -->
        <div class="bg-base-200 rounded-lg p-4">
          <h3 class="font-semibold mb-3 flex items-center gap-2">
            <BaseIcon name="calculator" size="sm" />
            Number Formatting Functions
          </h3>
          <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <p class="font-medium text-sm mb-2">Core Functions:</p>
              <div class="text-xs space-y-1">
                <div><code>numberToThai(input)</code> - Convert to Thai digits</div>
                <div><code>numberFromThai(thaiNumber)</code> - Convert from Thai</div>
                <div><code>formatNumber(num, options?)</code> - Format with locale</div>
                <div><code>formatWithCommas(input, decimals?, thai?)</code> - Format with commas</div>
                <div><code>formatCurrency(amount, options?)</code> - Currency format</div>
                <div><code>formatPercentage(value, isDecimal?)</code> - Percentage</div>
              </div>
            </div>
            <div>
              <p class="font-medium text-sm mb-2">Utility Functions:</p>
              <div class="text-xs space-y-1">
                <div><code>formatFileSize(bytes)</code> - File size format</div>
                <div><code>formatDuration(seconds)</code> - Duration format</div>
                <div><code>formatRange(start, end)</code> - Number ranges</div>
                <div><code>isValidNumber(input)</code> - Number validation</div>
                <div><code>parseThaiNumber(input)</code> - Parse Thai numbers</div>
                <div><code>formatOrdinal(number)</code> - Ordinal numbers</div>
              </div>
            </div>
          </div>
        </div>

        <!-- Usage Examples -->
        <div class="bg-base-200 rounded-lg p-4">
          <h3 class="font-semibold mb-3 flex items-center gap-2">
            <BaseIcon name="beaker" size="sm" />
            Usage Examples
          </h3>
          <div class="mockup-code text-sm">
            <pre data-prefix="1"><code>// Basic number formatting</code></pre>
            <pre data-prefix="2"><code>formatWithCommas(1234567.89) // "1,234,567.89"</code></pre>
            <pre data-prefix="3"><code>formatWithCommas(1234567.89, 2, true) // "๑,๒๓๔,๕๖๗.๘๙"</code></pre>
            <pre data-prefix="4"><code></code></pre>
            <pre data-prefix="5"><code>// Currency formatting</code></pre>
            <pre data-prefix="6"><code>formatCurrency(1500) // "฿1,500.00"</code></pre>
            <pre data-prefix="7"><code></code></pre>
            <pre data-prefix="8"><code>// Thai digit conversion</code></pre>
            <pre data-prefix="9"><code>numberToThai(123) // "๑๒๓"</code></pre>
            <pre data-prefix="10"><code>numberFromThai("๑๒๓") // "123"</code></pre>
            <pre data-prefix="11"><code></code></pre>
            <pre data-prefix="12"><code>// File size: 1.5 กิกะไบต์</code></pre>
            <pre data-prefix="13"><code>formatFileSize(1610612736)</code></pre>
            <pre data-prefix="14"><code></code></pre>
            <pre data-prefix="15"><code>// Template: { { formatWithCommas(price, 2) } }</code></pre>
          </div>
        </div>
      </div>
    </div>

    <!-- Global Plugins -->
    <div class="card bg-base-100 shadow-xl">
      <div class="card-body">
        <div class="alert alert-info">
          <BaseIcon name="information-circle" size="md" />
          <div>
            <h3 class="font-semibold">Global Formatter Plugins</h3>
            <p class="text-sm">Auto-injected formatters available globally in templates and components.</p>
          </div>
        </div>

        <!-- Global Usage -->
        <div class="bg-base-200 rounded-lg p-4">
          <h3 class="font-semibold mb-3 flex items-center gap-2">
            <BaseIcon name="globe-alt" size="sm" />
            Global Template Usage
          </h3>
          <div class="mockup-code text-sm">
            <pre data-prefix="1"><code>&lt;!-- Date formatting in templates --&gt;</code></pre>
            <pre data-prefix="2"><code>&lt;p&gt;{ { dateToThai(createdAt) } }&lt;/p&gt;</code></pre>
            <pre data-prefix="3"><code>&lt;p&gt;{ { getCurrentThaiDate() } }&lt;/p&gt;</code></pre>
            <pre data-prefix="4"><code></code></pre>
            <pre data-prefix="5"><code>&lt;!-- Number formatting in templates --&gt;</code></pre>
            <pre data-prefix="6"><code>&lt;p&gt;{ { formatWithCommas(price) } }&lt;/p&gt;</code></pre>
            <pre data-prefix="7"><code>&lt;p&gt;{ { formatCurrency(amount) } }&lt;/p&gt;</code></pre>
            <pre data-prefix="8"><code>&lt;p&gt;{ { numberToThai(count) } }&lt;/p&gt;</code></pre>
          </div>
        </div>

        <!-- Script Usage -->
        <div class="bg-base-200 rounded-lg p-4">
          <h3 class="font-semibold mb-3 flex items-center gap-2">
            <BaseIcon name="code-bracket" size="sm" />
            Script Usage
          </h3>
          <div class="mockup-code text-sm">
            <pre data-prefix="1"><code>// In script setup or composables</code></pre>
            <pre data-prefix="2"><code>const { dateToThai, getCurrentThaiDate } = useFormatDate()</code></pre>
            <pre data-prefix="3"><code>const { formatWithCommas, formatCurrency } = useFormatNumber()</code></pre>
            <pre data-prefix="4"><code></code></pre>
            <pre data-prefix="5"><code>// Usage</code></pre>
            <pre data-prefix="6"><code>const formattedDate = dateToThai(new Date())</code></pre>
            <pre data-prefix="7"><code>const formattedPrice = formatWithCommas(1234.56)</code></pre>
          </div>
        </div>

        <!-- Features -->
        <div class="bg-base-200 rounded-lg p-4">
          <h3 class="font-semibold mb-3 flex items-center gap-2">
            <BaseIcon name="sparkles" size="sm" />
            Key Features
          </h3>
          <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <p class="font-medium text-sm mb-2">Date Features:</p>
              <div class="text-xs space-y-1">
                <div>🗓️ Buddhist Era (พ.ศ.) support</div>
                <div>🌏 Thai language months</div>
                <div>⏰ Time formatting with Thai labels</div>
                <div>🔧 Multiple format options</div>
                <div>🔄 Bidirectional conversion</div>
              </div>
            </div>
            <div>
              <p class="font-medium text-sm mb-2">Number Features:</p>
              <div class="text-xs space-y-1">
                <div>🔢 Thai digit conversion</div>
                <div>💰 Currency formatting (฿)</div>
                <div>📊 Percentage formatting</div>
                <div>💾 File size formatting</div>
                <div>⏱️ Duration formatting</div>
                <div>📋 Range formatting</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
// No props needed for utility components as they're all composables/functions
</script>