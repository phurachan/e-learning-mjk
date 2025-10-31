import type { BaseState } from './base'
import type { Room } from '~/composables/data_models/rooms'

export interface RoomsState extends BaseState<Room> {}

export interface RoomListRequest {
  search?: string
  'filter[grade]'?: number
  'filter[academicYear]'?: string
  'filter[isActive]'?: boolean
}

export interface RoomCreateRequest {
  name: string
  code: string
  grade: number
  section: string
  academicYear: string
  capacity: number
  isActive?: boolean
}

export interface RoomUpdateRequest extends RoomCreateRequest {
  id: string
}

export interface RoomDeleteRequest {
  id: string
}
