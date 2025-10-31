<template>
  <div class="space-y-8">
    <!-- BaseTable Component -->
    <div class="card bg-base-100 shadow-xl">
      <div class="card-body">
        <div class="alert alert-info">
          <BaseIcon name="information-circle" size="md" />
          <div>
            <h3 class="font-semibold">BaseTable Component</h3>
            <p class="text-sm">Simple data table with sorting, hover effects, and customizable styling.</p>
          </div>
        </div>

        <!-- Basic Example -->
        <div class="bg-base-200 rounded-lg p-4">
          <h3 class="font-semibold mb-3 flex items-center gap-2">
            <BaseIcon name="table-cells" size="sm" />
            Basic Table
          </h3>
          <BaseTable 
            :data="tableDemo.users"
            :columns="tableDemo.columns"
            :loading="tableDemo.loading"
            @sort="handleTableSort"
            @edit="handleTableEdit"
            @delete="handleTableDelete"
          />
        </div>

        <!-- Props Documentation -->
        <div class="bg-base-200 rounded-lg p-4">
          <h3 class="font-semibold mb-3 flex items-center gap-2">
            <BaseIcon name="adjustments-horizontal" size="sm" />
            Props
          </h3>
          <div class="text-xs space-y-1">
            <div><code>data: any[]</code> - Table data array</div>
            <div><code>columns: Column[]</code> - Column configuration</div>
            <div><code>loading?: boolean</code> - Loading state</div>
          </div>
        </div>
      </div>
    </div>

    <!-- BaseDataTable Component -->
    <div class="card bg-base-100 shadow-xl">
      <div class="card-body">
        <div class="alert alert-info">
          <BaseIcon name="information-circle" size="md" />
          <div>
            <h3 class="font-semibold">BaseDataTable Component</h3>
            <p class="text-sm">Advanced data table with selection, nested rows, server-side features, and comprehensive controls.</p>
          </div>
        </div>

        <!-- Advanced Example -->
        <div class="bg-base-200 rounded-lg p-4">
          <h3 class="font-semibold mb-3 flex items-center gap-2">
            <BaseIcon name="table-cells" size="sm" />
            Advanced DataTable
          </h3>
          <BaseDataTable
            :data="dataTableData"
            :fields="dataTableFields"
            v-model:selected-rows="dataTableDemo.selectedRows"
            :loading="false"
            :nested="true"
            :selectable="true"
            :searchable="true"
            :filterable="true"
            :per-page="10"
          />
        </div>

        <!-- Props Documentation -->
        <div class="bg-base-200 rounded-lg p-4">
          <h3 class="font-semibold mb-3 flex items-center gap-2">
            <BaseIcon name="adjustments-horizontal" size="sm" />
            Props
          </h3>
          <div class="text-xs space-y-1">
            <div><code>data: any[]</code> - Table data array</div>
            <div><code>fields: Field[]</code> - Field configuration with formatters</div>
            <div><code>selectedRows?: any[]</code> - Selected rows (v-model)</div>
            <div><code>nested?: boolean</code> - Enable nested rows support</div>
            <div><code>selectable?: boolean</code> - Enable row selection</div>
            <div><code>searchable?: boolean</code> - Enable global search</div>
            <div><code>filterable?: boolean</code> - Enable column filters</div>
            <div><code>perPage?: number</code> - Items per page (pagination)</div>
          </div>
        </div>
      </div>
    </div>

    <!-- BasePagination Component -->
    <div class="card bg-base-100 shadow-xl">
      <div class="card-body">
        <div class="alert alert-info">
          <BaseIcon name="information-circle" size="md" />
          <div>
            <h3 class="font-semibold">BasePagination Component</h3>
            <p class="text-sm">Pagination component using DaisyUI join pattern for navigating between pages of data content.</p>
          </div>
        </div>

        <!-- Pagination Example -->
        <div class="bg-base-200 rounded-lg p-4">
          <h3 class="font-semibold mb-3 flex items-center gap-2">
            <BaseIcon name="bars-3-bottom-left" size="sm" />
            Data Pagination Example
          </h3>
          <BasePagination 
            :current-page="paginationDemo.currentPage"
            :total-items="100"
            :per-page="10"
            :max-pages="5"
            @page-change="paginationDemo.currentPage = $event"
          />
        </div>

        <!-- Props Documentation -->
        <div class="bg-base-200 rounded-lg p-4">
          <h3 class="font-semibold mb-3 flex items-center gap-2">
            <BaseIcon name="adjustments-horizontal" size="sm" />
            Props
          </h3>
          <div class="text-xs space-y-1">
            <div><code>currentPage: number</code> - Current active page</div>
            <div><code>totalItems: number</code> - Total number of items</div>
            <div><code>perPage?: number</code> - Items per page (default: 20)</div>
            <div><code>maxPages?: number</code> - Max page buttons to show (default: 5)</div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
// Props from parent component
const props = defineProps({
  tableDemo: {
    type: Object,
    required: true
  },
  dataTableDemo: {
    type: Object,
    required: true
  },
  dataTableData: {
    type: Array,
    required: true
  },
  dataTableFields: {
    type: Array,
    required: true
  },
  paginationDemo: {
    type: Object,
    required: true
  },
  handleTableSort: {
    type: Function,
    required: true
  },
  handleTableEdit: {
    type: Function,
    required: true
  },
  handleTableDelete: {
    type: Function,
    required: true
  }
})
</script>