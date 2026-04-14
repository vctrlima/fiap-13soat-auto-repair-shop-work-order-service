import { Service } from '@/domain/entities';
import { ServiceRepositoryType } from '@/infra/db/types';

export class ServiceMapper {
  static toDomain(data: ServiceRepositoryType): Service {
    return {
      id: data.id,
      name: data.name,
      description: data.description,
      price: data.price,
      createdAt: data.createdAt,
      updatedAt: data.updatedAt,
    };
  }
}
