export interface Employee {
  _id: string; // ID из MongoDB
  login: string
  password: string
  name: string
  position: string
  department: string
  status: 'active' | 'inactive'
  currentLocation: string
  workStatus: 'online' | 'break' | 'offline'
  lastCheckIn: string
  rating: number
  penalties: number
  shiftStart: string
  shiftEnd: string
  lunchStart: string
  lunchEnd: string
}