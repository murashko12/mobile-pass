import { Button } from "../ui/button"
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { mockEmployees } from "@/mock/data"
import type { Employee } from "@/types/Employee"
import { useState } from "react"

const modal = () => {
    const emptyEmployee: Omit<Employee, 'id'> = {
  login: "",
  password: "",
  name: "",
  position: "",
  department: "IT",
  status: "active",
  currentLocation: "Не в офисе",
  workStatus: "offline",
  lastCheckIn: new Date().toLocaleString('ru-RU'),
  rating: 100,
  penalties: 0,
  shiftStart: "09:00",
  shiftEnd: "18:00",
  lunchStart: "13:00",
  lunchEnd: "14:00"
}
    const [employees, setEmployees] = useState<Employee[]>(mockEmployees)
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [editingEmployee, setEditingEmployee] = useState<Employee | null>(null)
  const [formData, setFormData] = useState<Omit<Employee, 'id'> | Employee>(emptyEmployee)

  


  const handleAddEmployee = () => {
    setEditingEmployee(null)
    setFormData(emptyEmployee)
    setIsDialogOpen(true)
  }

  

  const handleSaveEmployee = () => {
    if (editingEmployee) {
      setEmployees(employees.map(emp => 
        emp.id === editingEmployee.id ? { ...formData as Employee, id: editingEmployee.id } : emp
      ))
    } else {
      const newEmployee: Employee = {
        ...formData as Omit<Employee, 'id'>,
        id: `EMP${String(employees.length + 1).padStart(3, '0')}`
      }
      setEmployees([...employees, newEmployee])
    }
    setIsDialogOpen(false)
    setFormData(emptyEmployee)
  }


  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }))
  }
    return (
        <>
            <Button onClick={handleAddEmployee}>Добавить сотрудника</Button>  
            <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              {editingEmployee ? 'Редактирование сотрудника' : 'Добавление нового сотрудника'}
            </DialogTitle>
            <DialogDescription>
              Заполните информацию для доступа к системе пропусков
            </DialogDescription>
          </DialogHeader>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 py-4">
            
            <div className="space-y-4">
              <h3 className="font-semibold">Основная информация</h3>
              
              <div className="space-y-2">
                <Label htmlFor="login">Логин <span className="text-red-500">*</span></Label>
                <Input 
                  id="login"
                  value={formData.login}
                  onChange={(e) => handleInputChange('login', e.target.value)}
                  placeholder="Введите логин" 
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="password">Пароль <span className="text-red-500">*</span></Label>
                <Input 
                  id="password"
                  type="password"
                  value={formData.password}
                  onChange={(e) => handleInputChange('password', e.target.value)}
                  placeholder="Введите пароль" 
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="name">ФИО <span className="text-red-500"><span className="text-red-500">*</span></span></Label>
                <Input 
                  id="name"
                  value={formData.name}
                  onChange={(e) => handleInputChange('name', e.target.value)}
                  placeholder="Введите полное имя" 
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="position">Должность <span className="text-red-500">*</span></Label>
                <Input 
                  id="position"
                  value={formData.position}
                  onChange={(e) => handleInputChange('position', e.target.value)}
                  placeholder="Введите должность" 
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="department">Отдел</Label>
                <Select 
                  value={formData.department} 
                  onValueChange={(value) => handleInputChange('department', value)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Выберите отдел" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="IT">IT</SelectItem>
                    <SelectItem value="Продажи">Продажи</SelectItem>
                    <SelectItem value="Дизайн">Дизайн</SelectItem>
                    <SelectItem value="Аналитика">Аналитика</SelectItem>
                    <SelectItem value="HR">HR</SelectItem>
                    <SelectItem value="Маркетинг">Маркетинг</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="space-y-4">
              <h3 className="font-semibold">График работы</h3>

              <div className="grid grid-cols-2 gap-2">
                <div className="space-y-2">
                  <Label htmlFor="shiftStart">Начало смены</Label>
                  <Input 
                    id="shiftStart"
                    type="time"
                    value={formData.shiftStart}
                    onChange={(e) => handleInputChange('shiftStart', e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="shiftEnd">Конец смены</Label>
                  <Input 
                    id="shiftEnd"
                    type="time"
                    value={formData.shiftEnd}
                    onChange={(e) => handleInputChange('shiftEnd', e.target.value)}
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div className="space-y-2">
                  <Label htmlFor="lunchStart">Начало обеда</Label>
                  <Input 
                    id="lunchStart"
                    type="time"
                    value={formData.lunchStart}
                    onChange={(e) => handleInputChange('lunchStart', e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="lunchEnd">Конец обеда</Label>
                  <Input 
                    id="lunchEnd"
                    type="time"
                    value={formData.lunchEnd}
                    onChange={(e) => handleInputChange('lunchEnd', e.target.value)}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="status">Статус сотрудника</Label>
                <Select 
                  value={formData.status} 
                  onValueChange={(value: 'active' | 'inactive') => handleInputChange('status', value)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Выберите статус" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="active">Активен</SelectItem>
                    <SelectItem value="inactive">Неактивен</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="workStatus">Рабочий статус</Label>
                <Select 
                  value={formData.workStatus} 
                  onValueChange={(value: 'working' | 'break' | 'offline') => handleInputChange('workStatus', value)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Выберите статус" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="working">Работает</SelectItem>
                    <SelectItem value="break">Обед</SelectItem>
                    <SelectItem value="offline">Не на смене</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="rating">Рейтинг</Label>
                <Input 
                  id="rating"
                  type="number"
                  min="0"
                  max="100"
                  value={formData.rating}
                  onChange={(e) => handleInputChange('rating', e.target.value)}
                  placeholder="0-100" 
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="penalties">Штрафные баллы</Label>
                <Input 
                  id="penalties"
                  type="number"
                  min="0"
                  value={formData.penalties}
                  onChange={(e) => handleInputChange('penalties', e.target.value)}
                  placeholder="0" 
                />
              </div>
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
              Отмена
            </Button>
            <Button onClick={handleSaveEmployee}>
              {editingEmployee ? 'Сохранить изменения' : 'Добавить сотрудника'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
        </>
    )
}

export default modal
