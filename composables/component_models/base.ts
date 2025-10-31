// Base component interfaces and types
export interface BaseComponentProps {
  id?: string
  class?: string
  disabled?: boolean
  loading?: boolean
}

export interface BreadcrumbItem {
  label: string
  to?: string
  icon?: string
  class?: string
}

export interface MenuBadge {
  text: string
  variant: 'primary' | 'secondary' | 'accent' | 'info' | 'success' | 'warning' | 'error' | 'neutral'
}

export interface IconProps extends BaseComponentProps {
  name: string
  variant?: 'outline' | 'solid' | 'mini'
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl' | '2xl'
}

export interface ButtonProps extends BaseComponentProps {
  variant?: 'primary' | 'secondary' | 'accent' | 'info' | 'success' | 'warning' | 'error' | 'ghost' | 'link'
  size?: 'xs' | 'sm' | 'md' | 'lg'
  outline?: boolean
  block?: boolean
  square?: boolean
  circle?: boolean
}

export type ComponentVariant = 'primary' | 'secondary' | 'accent' | 'info' | 'success' | 'warning' | 'error' | 'neutral'
export type ComponentSize = 'xs' | 'sm' | 'md' | 'lg' | 'xl' | '2xl'