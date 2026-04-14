import { Status } from '@/domain/enums';

export interface WorkOrder {
  id: string;
  customerId: string;
  vehicleId: string;
  services: WorkOrderService[];
  partsAndSupplies: WorkOrderPartOrSupply[];
  status: Status;
  budget: number;
  createdAt: Date;
  updatedAt?: Date | null;
}

export interface WorkOrderService {
  id: string;
  workOrderId: string;
  serviceId: string;
  service?: Service;
  quantity: number;
}

export interface WorkOrderPartOrSupply {
  id: string;
  workOrderId: string;
  partOrSupplyId: string;
  partOrSupply?: PartOrSupply;
  quantity: number;
}

export interface Service {
  id: string;
  name: string;
  description?: string | null;
  price: number;
  createdAt: Date;
  updatedAt?: Date | null;
}

export interface PartOrSupply {
  id: string;
  name: string;
  description?: string | null;
  price: number;
  inStock: number;
  createdAt: Date;
  updatedAt?: Date | null;
}
