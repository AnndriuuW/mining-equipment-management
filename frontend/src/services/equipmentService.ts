
const API_URL = import.meta.env.VITE_API_URL

export interface Equipment {
  id: number
  code: string
  typeCode: string
  typeName: string
  hourMeter: number
  lastMaintenanceHourMeter: number
  maintenanceIntervalHours: number
  requiresMaintenance: boolean
  createdAt: string
  updatedAt: string
}

export interface EquipmentType {
  id: number
  code: string
  name: string
  maintenanceIntervalHours: number
}

export interface Maintenance {
  id: number
  equipmentId: number
  equipmentCode: string
  hourMeter: number
  description: string
  performedAt: string
}

async function request<T>(
  endpoint: string,
  options?: RequestInit,
): Promise<T> {
  const response = await fetch(`${API_URL}${endpoint}`, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...options?.headers,
    },
  })

  if (!response.ok) {
    const message = await response.text()
    throw new Error(message || `Error HTTP: ${response.status}`)
  }

  if (response.status === 204) {
    return undefined as T
  }

  return response.json() as Promise<T>
}

export const equipmentService = {
  getAll: () => request<Equipment[]>('/equipment'),

  getById: (id: number) =>
    request<Equipment>(`/equipment/${id}`),

  getTypes: () =>
    request<EquipmentType[]>('/equipment-types'),

  create: (equipment: {
    code: string
    typeId: number
    hourMeter: number
  }) =>
    request<Equipment>('/equipment', {
      method: 'POST',
      body: JSON.stringify(equipment),
    }),

  update: (
    id: number,
    equipment: {
      code: string
      typeId: number
      hourMeter: number
    },
  ) =>
    request<Equipment>(`/equipment/${id}`, {
      method: 'PUT',
      body: JSON.stringify(equipment),
    }),

  delete: (id: number) =>
    request<void>(`/equipment/${id}`, {
      method: 'DELETE',
    }),

  registerMaintenance: (
    equipmentId: number,
    description: string,
  ) =>
    request<Maintenance>(
      `/maintenance/equipment/${equipmentId}`,
      {
        method: 'POST',
        body: JSON.stringify({ description }),
      },
    ),

  getMaintenanceHistory: (equipmentId: number) =>
    request<Maintenance[]>(
      `/maintenance/equipment/${equipmentId}/history`,
    ),
}
