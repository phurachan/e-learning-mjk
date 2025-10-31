// Form-related interfaces and types
export interface FormField {
  name: string
  label: string
  type: 'text' | 'email' | 'password' | 'number' | 'textarea' | 'select' | 'checkbox' | 'radio' | 'file' | 'date' | 'datetime-local' | 'time'
  value?: any
  placeholder?: string
  required?: boolean
  disabled?: boolean
  readonly?: boolean
  validation?: ValidationRule[]
  options?: SelectOption[] // For select, radio
  hint?: string
  error?: string
}

export interface SelectOption {
  label: string
  value: any
  disabled?: boolean
  icon?: string
}

export interface ValidationRule {
  type: 'required' | 'email' | 'min' | 'max' | 'pattern' | 'custom'
  value?: any
  message: string
  validator?: (value: any) => boolean
}

export interface FormState {
  fields: Record<string, FormField>
  errors: Record<string, string>
  isValid: boolean
  isSubmitting: boolean
  isDirty: boolean
  touched: Record<string, boolean>
}

export interface FormConfig {
  fields: FormField[]
  submitText?: string
  resetText?: string
  showReset?: boolean
  inline?: boolean
  size?: ComponentSize
}

// Base Input Props Interface
export interface BaseInputProps {
  type?: 'text' | 'email' | 'password' | 'number' | 'tel' | 'url' | 'search'
  modelValue?: string | number
  label?: string
  placeholder?: string
  required?: boolean
  disabled?: boolean
  readonly?: boolean
  error?: string
  hint?: string
  size?: 'xs' | 'sm' | 'md' | 'lg'
  variant?: 'default' | 'bordered' | 'ghost' | 'primary' | 'secondary' | 'accent' | 'info' | 'success' | 'warning' | 'error'
  id?: string
  name?: string
  autocomplete?: string
  maxlength?: number
  minlength?: number
  min?: number | string
  max?: number | string
  step?: number | string
}

// Time object interface for time picker
export interface TimeObject {
  hours: number
  minutes: number
  seconds?: number
}

// Date Picker Props Interface
export interface BaseDatePickerProps {
  modelValue?: string | Date | TimeObject | null
  label?: string
  placeholder?: string
  required?: boolean
  disabled?: boolean
  readonly?: boolean
  error?: string
  hint?: string
  size?: 'xs' | 'sm' | 'md' | 'lg'
  variant?: 'default' | 'bordered' | 'ghost' | 'primary' | 'secondary' | 'accent' | 'info' | 'success' | 'warning' | 'error'
  type?: 'date' | 'datetime-local' | 'time'
  min?: string
  max?: string
  id?: string
  name?: string
}

// Checkbox Props Interface
export interface BaseCheckboxProps {
  modelValue?: boolean
  label?: string
  required?: boolean
  disabled?: boolean
  error?: string
  hint?: string
  size?: 'xs' | 'sm' | 'md' | 'lg'
  variant?: 'default' | 'primary' | 'secondary' | 'accent' | 'info' | 'success' | 'warning' | 'error'
  id?: string
  name?: string
  indeterminate?: boolean
}

// Radio Props Interface
export interface BaseRadioProps {
  modelValue?: string | number | boolean
  value: string | number | boolean
  name: string
  label?: string
  required?: boolean
  disabled?: boolean
  error?: string
  hint?: string
  size?: 'xs' | 'sm' | 'md' | 'lg'
  variant?: 'default' | 'primary' | 'secondary' | 'accent' | 'info' | 'success' | 'warning' | 'error'
  id?: string
}

// Button Props Interface
export interface BaseButtonProps {
  type?: 'button' | 'submit' | 'reset'
  label?: string
  size?: 'xs' | 'sm' | 'md' | 'lg'
  variant?: 'default' | 'primary' | 'secondary' | 'accent' | 'info' | 'success' | 'warning' | 'error' | 'ghost' | 'link'
  disabled?: boolean
  loading?: boolean
  outline?: boolean
  block?: boolean
  glass?: boolean
  square?: boolean
  circle?: boolean
  wide?: boolean
  active?: boolean
  iconLeft?: string
  iconRight?: string
  id?: string
  // Submit loading props
  submitLoading?: boolean
  loadingText?: string
  successText?: string
  successDuration?: number
}

// Select Option Interface
export interface SelectOption {
  label: string
  value: any
  disabled?: boolean
  icon?: string
  description?: string
}

// Select Props Interface
export interface BaseSelectProps {
  modelValue?: string | number | null
  options: SelectOption[]
  label?: string
  placeholder?: string
  required?: boolean
  disabled?: boolean
  error?: string
  hint?: string
  size?: 'xs' | 'sm' | 'md' | 'lg'
  variant?: 'default' | 'primary' | 'secondary' | 'accent' | 'info' | 'success' | 'warning' | 'error'
  id?: string
  name?: string
  hidePlaceholder?: boolean
  autoSelectFirst?: boolean
}

// Autocomplete Option Interface
export interface AutocompleteOption {
  [key: string]: any // Allow flexible option structure
  label?: string
  value?: string | number
  disabled?: boolean
  icon?: string
  description?: string
}

// Autocomplete Props Interface
export interface BaseAutocompleteProps {
  modelValue?: string | number | null
  displayValue?: string
  options: AutocompleteOption[]
  label?: string
  placeholder?: string
  required?: boolean
  disabled?: boolean
  readonly?: boolean
  error?: string
  hint?: string
  size?: 'xs' | 'sm' | 'md' | 'lg'
  variant?: 'default' | 'primary' | 'secondary' | 'accent' | 'info' | 'success' | 'warning' | 'error'
  minChars?: number
  debounceMs?: number
  maxResults?: number
  clearable?: boolean
  searchApi?: string | ((query: string) => Promise<AutocompleteOption[]>)
  displayKey?: string
  valueKey?: string
  noResultsText?: string
  id?: string
  name?: string
}

// Pagination Props Interface
export interface BasePaginationProps {
  currentPage: number
  totalItems?: number | null
  perPage?: number
  size?: 'xs' | 'sm' | 'md' | 'lg'
  showFirstLast?: boolean
  showPrevNext?: boolean
  maxPages?: number
  disabled?: boolean
  // Full width layout props
  showInfo?: boolean
  infoText?: string
}

// DataTable Field Configuration
export interface DataTableField {
  key: string
  label: string
  hidden?: boolean
  sortable?: boolean
  width?: string
  align?: 'left' | 'center' | 'right'
  type?: 'text' | 'number' | 'date' | 'boolean' | 'custom'
  formatter?: (value: any, row: any) => string | any
}

// DataTable Row Data (with support for nested children)
export interface DataTableRow {
  [key: string]: any
  children?: DataTableRow[]
  _expanded?: boolean
  _selected?: boolean
  _disabled?: boolean
}

// DataTable Props Interface
export interface BaseDataTableProps {
  fields: DataTableField[]
  data: DataTableRow[]
  rowKey?: string
  selectable?: boolean
  multiSelect?: boolean
  expandable?: boolean
  loading?: boolean
  emptyText?: string
  size?: 'xs' | 'sm' | 'md' | 'lg'
  striped?: boolean
  bordered?: boolean
  hover?: boolean
}

// Alert Props Interface
export interface BaseAlertProps {
  type?: 'success' | 'error' | 'warning' | 'info' | 'confirm'
  title?: string
  message: string
  visible?: boolean
  dismissible?: boolean
  icon?: string
  duration?: number
  position?: 'top' | 'bottom' | 'center'
  confirmText?: string
  cancelText?: string
  showCancel?: boolean
}

// Alert Action Interface
export interface AlertAction {
  label: string
  action: 'confirm' | 'cancel' | 'dismiss'
  variant?: 'default' | 'primary' | 'secondary' | 'accent' | 'info' | 'success' | 'warning' | 'error'
}

// Loading Props Interface
export interface BaseLoadingProps {
  visible?: boolean
  message?: string
  size?: 'xs' | 'sm' | 'md' | 'lg'
  spinner?: 'spinner' | 'dots' | 'ring' | 'ball' | 'bars' | 'infinity'
  backdrop?: boolean
  backdropColor?: string
}

// Modal Props Interface
export interface BaseModalProps {
  visible?: boolean
  title?: string
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl'| '2xl' | '3xl' | '4xl' | '5xl' | 'full'
  closeable?: boolean
  backdrop?: boolean
  backdropClose?: boolean
}