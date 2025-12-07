import { Button } from "@/components/ui/button"
import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableHead,
  TableHeader,
  TableRow
} from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { useState } from "react"
import type { Employee } from "./types/Employee"
import { 
  useGetEmployeesQuery, 
  useCreateEmployeeMutation, 
  useUpdateEmployeeMutation, 
  useDeleteEmployeeMutation 
} from "./store/employeesApi"

const emptyEmployee: Omit<Employee, 'id' | '_id'> = {
  login: "",
  password: "",
  name: "",
  position: "",
  department: "IT",
  status: "active",
  currentLocation: "Не в офисе",
  workStatus: "offline",
  lastCheckIn: new Date().toISOString(),
  rating: 100,
  penalties: 0,
  shiftStart: "09:00",
  shiftEnd: "18:00",
  lunchStart: "13:00",
  lunchEnd: "14:00"
}

function App() {
  const { data: employees = [], isLoading, error } = useGetEmployeesQuery()
  const [createEmployee, { isLoading: isCreating }] = useCreateEmployeeMutation()
  const [updateEmployee, { isLoading: isUpdating }] = useUpdateEmployeeMutation()
  const [deleteEmployee, { isLoading: isDeleting }] = useDeleteEmployeeMutation()

  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [editingEmployee, setEditingEmployee] = useState<Employee | null>(null)
  const [formData, setFormData] = useState<Omit<Employee, 'id' | '_id'> | Employee>(emptyEmployee)
  const [formError, setFormError] = useState<string | null>(null)

  const getStatusBadge = (status: Employee['status']) => {
    return status === 'active' 
      ? <Badge variant="default">Активен</Badge>
      : <Badge variant="secondary">Неактивен</Badge>
  }

  const getWorkStatusBadge = (workStatus: Employee['workStatus']) => {
    const variants = {
      //working: { label: 'Работает', variant: 'default' as const },
      online: {label: 'Работает', variant: 'default' as const },
      break: { label: 'Обед', variant: 'secondary' as const },
      offline: { label: 'Не на смене', variant: 'outline' as const }
    }
    
    const status = variants[workStatus]
    if (!status) {
      return <Badge variant="outline">Неизвестно</Badge>
    }
    return <Badge variant={status.variant}>{status.label}</Badge>
  }

  const getRatingColor = (rating: number) => {
    if (rating >= 90) return "text-green-600"
    if (rating >= 80) return "text-yellow-600"
    return "text-red-600"
  }

  const handleAddEmployee = () => {
    setEditingEmployee(null)
    setFormData(emptyEmployee)
    setFormError(null)
    setIsDialogOpen(true)
  }

  const handleEditEmployee = (employee: Employee) => {
    setEditingEmployee(employee)
    setFormData(employee)
    setFormError(null)
    setIsDialogOpen(true)
  }

  const validateForm = (): boolean => {
    const requiredFields = ['login', 'password', 'name', 'position'] as const
    
    for (const field of requiredFields) {
      if (!formData[field]?.trim()) {
        setFormError(`Поле "${getFieldLabel(field)}" обязательно для заполнения`)
        return false
      }
    }

    if (formData.rating < 0 || formData.rating > 100) {
      setFormError('Рейтинг должен быть в диапазоне от 0 до 100')
      return false
    }

    if (formData.penalties < 0) {
      setFormError('Штрафные баллы не могут быть отрицательными')
      return false
    }

    setFormError(null)
    return true
  }

  const getFieldLabel = (field: string): string => {
    const labels: { [key: string]: string } = {
      login: 'Логин',
      password: 'Пароль',
      name: 'ФИО',
      position: 'Должность'
    }
    return labels[field] || field
  }

  const handleSaveEmployee = async () => {
    if (!validateForm()) {
      return
    }

    try {
      // Подготовка данных для отправки
      const requestData = {
        login: formData.login,
        password: formData.password,
        name: formData.name,
        position: formData.position,
        department: formData.department,
        status: formData.status,
        currentLocation: formData.currentLocation,
        workStatus: formData.workStatus,
        lastCheckIn: formData.lastCheckIn || new Date().toISOString(),
        rating: Number(formData.rating),
        penalties: Number(formData.penalties),
        shiftStart: formData.shiftStart,
        shiftEnd: formData.shiftEnd,
        lunchStart: formData.lunchStart,
        lunchEnd: formData.lunchEnd,
      }

      console.log('Отправляемые данные:', requestData)

      if (editingEmployee) {
        // Обновление существующего сотрудника
        await updateEmployee({
          id: editingEmployee._id,
          employee: requestData
        }).unwrap()
        console.log('Сотрудник успешно обновлен')
      } else {
        // Создание нового сотрудника
        await createEmployee(requestData).unwrap()
        console.log('Сотрудник успешно создан')
      }
      
      setIsDialogOpen(false)
      setFormData(emptyEmployee)
      setEditingEmployee(null)
      setFormError(null)
    } catch (error) {
      console.error('Ошибка при сохранении сотрудника:', error)
      setFormError('Произошла ошибка при сохранении. Проверьте данные и попробуйте снова.')
    }
  }

  const handleDeleteEmployee = async (employee: Employee) => {
    if (!confirm('Вы уверены, что хотите удалить этого сотрудника?')) {
      return
    }

    try {
      await deleteEmployee(employee._id).unwrap()
      console.log('Сотрудник успешно удален')
    } catch (error) {
      console.error('Ошибка при удалении сотрудника:', error)
      alert('Не удалось удалить сотрудника. Попробуйте снова.')
    }
  }

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }))
    
    // Очищаем ошибку при изменении поля
    if (formError) {
      setFormError(null)
    }
  }

  // Пока данные загружаются
  if (isLoading) {
    return (
      <div className="container mx-auto p-6">
        <div className="flex justify-center items-center h-64">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900 mx-auto mb-4"></div>
            <p>Загрузка данных...</p>
          </div>
        </div>
      </div>
    )
  }

  // Если произошла ошибка
  if (error) {
    return (
      <div className="container mx-auto p-6">
        <div className="flex justify-center items-center h-64">
          <div className="text-center">
            <p className="text-red-500 text-lg mb-4">Ошибка при загрузке данных</p>
            <Button onClick={() => window.location.reload()}>
              Попробовать снова
            </Button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Мобильный пропуск - Панель управления</h1>
          <p className="text-gray-600">Управление сотрудниками и доступом к помещениям</p>
        </div>
        <div className="space-x-2">
          <Button 
            onClick={handleAddEmployee}
            disabled={isCreating || isUpdating}
          >
            Добавить сотрудника
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Всего сотрудников</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{employees.length}</div>
            <p className="text-xs text-gray-600">
              {employees.filter(e => e.status === 'active').length} активных
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Сейчас в офисе</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {employees.filter(e => e.workStatus !== 'offline').length}
            </div>
            <p className="text-xs text-gray-600">
              {employees.filter(e => e.workStatus === 'online').length} работают
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Средний рейтинг</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {employees.length > 0 
                ? Math.round(employees.reduce((acc, e) => acc + e.rating, 0) / employees.length)
                : 0
              }
            </div>
            <p className="text-xs text-gray-600">по системе добросовестности</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Нарушения сегодня</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">
              {employees.reduce((acc, e) => acc + e.penalties, 0)}
            </div>
            <p className="text-xs text-gray-600">опоздания/переработки</p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Список сотрудников</CardTitle>
          <CardDescription>Управление доступом и просмотр статистики</CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableCaption>Список всех сотрудников системы мобильного пропуска</TableCaption>
            <TableHeader>
              <TableRow>
                <TableHead>ID</TableHead>
                <TableHead>ФИО</TableHead>
                <TableHead>Должность</TableHead>
                <TableHead>Отдел</TableHead>
                <TableHead>Смена</TableHead>
                <TableHead>Обед</TableHead>
                <TableHead>Статус</TableHead>
                <TableHead>Рабочий статус</TableHead>
                <TableHead>Последний вход</TableHead>
                <TableHead>Рейтинг</TableHead>
                <TableHead>Штрафы</TableHead>
                <TableHead className="text-right">Действия</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {employees.map((employee) => (
                <TableRow key={employee._id}>
                  <TableCell className="font-medium">{employee._id}</TableCell>
                  <TableCell>{employee.name}</TableCell>
                  <TableCell>{employee.position}</TableCell>
                  <TableCell>{employee.department}</TableCell>
                  <TableCell>
                    <div className="text-sm">
                      <div>{employee.shiftStart} - {employee.shiftEnd}</div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="text-sm">
                      <div>{employee.lunchStart} - {employee.lunchEnd}</div>
                    </div>
                  </TableCell>
                  <TableCell>{getStatusBadge(employee.status)}</TableCell>
                  <TableCell>{getWorkStatusBadge(employee.workStatus)}</TableCell>
                  <TableCell>
                    {employee.lastCheckIn ? new Date(employee.lastCheckIn).toLocaleString('ru-RU') : 'Нет данных'}
                  </TableCell>
                  <TableCell className={`font-bold ${getRatingColor(employee.rating)}`}>
                    {employee.rating}
                  </TableCell>
                  <TableCell>
                    {employee.penalties > 0 ? (
                      <Badge variant="destructive">{employee.penalties}</Badge>
                    ) : (
                      <Badge variant="outline">0</Badge>
                    )}
                  </TableCell>
                  <TableCell className="text-right space-x-2">
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={() => handleEditEmployee(employee)}
                      disabled={isDeleting}
                    >
                      Редактировать
                    </Button>
                    <Button 
                      variant="destructive" 
                      size="sm"
                      onClick={() => handleDeleteEmployee(employee)}
                      disabled={isDeleting}
                    >
                      {isDeleting ? 'Удаление...' : 'Удалить'}
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

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
          
          {formError && (
            <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
              {formError}
            </div>
          )}
          
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
                <Label htmlFor="name">ФИО <span className="text-red-500">*</span></Label>
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
                <Label htmlFor="rating">Рейтинг (0-100)</Label>
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
            <Button 
              variant="outline" 
              onClick={() => setIsDialogOpen(false)}
              disabled={isCreating || isUpdating}
            >
              Отмена
            </Button>
            <Button 
              onClick={handleSaveEmployee}
              disabled={isCreating || isUpdating}
            >
              {isCreating || isUpdating ? 'Сохранение...' : 
               editingEmployee ? 'Сохранить изменения' : 'Добавить сотрудника'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}

export default App