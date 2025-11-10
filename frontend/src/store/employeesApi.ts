import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react'
import type { Employee } from '../types/Employee'

// Функция для преобразования данных с сервера
const transformEmployee = (employee: any): Employee => {
  return {
    ...employee,
    id: employee._id, // используем _id от MongoDB как id
  }
}

export const employeesApi = createApi({
  reducerPath: 'employeesApi',
  baseQuery: fetchBaseQuery({
    baseUrl: 'http://localhost:3001/employees/'
  }),
  tagTypes: ['Employee'],
  endpoints: (builder) => ({
    getEmployees: builder.query<Employee[], void>({
      query: () => '',
      providesTags: ['Employee'],
      transformResponse: (response: any[]) => {
        return response.map(transformEmployee)
      }
    }),
    getEmployeeById: builder.query<Employee, string>({
      query: (id) => id,
      providesTags: ['Employee'],
      transformResponse: transformEmployee
    }),
    createEmployee: builder.mutation<Employee, Omit<Employee, 'id' | '_id'>>({
      query: (employee) => ({
        url: '',
        method: 'POST',
        body: employee
      }),
      invalidatesTags: ['Employee'],
      transformResponse: transformEmployee
    }),
    updateEmployee: builder.mutation<Employee, { id: string; employee: Partial<Employee> }>({
      query: ({ id, employee }) => ({
        url: id,
        method: 'PUT',
        body: employee
      }),
      invalidatesTags: ['Employee'],
      transformResponse: transformEmployee
    }),
    deleteEmployee: builder.mutation<void, string>({
      query: (id) => ({
        url: id,
        method: 'DELETE'
      }),
      invalidatesTags: ['Employee']
    })
  })
})

export const {
  useGetEmployeesQuery,
  useGetEmployeeByIdQuery,
  useCreateEmployeeMutation,
  useUpdateEmployeeMutation,
  useDeleteEmployeeMutation
} = employeesApi