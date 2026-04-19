import { PartOrSupply } from "@/domain/entities";
import { PartOrSupplyRepositoryType } from "@/infra/db/types";

export class PartOrSupplyMapper {
  static toDomain(data: PartOrSupplyRepositoryType): PartOrSupply {
    return {
      id: data.id,
      name: data.name,
      description: data.description,
      price: Number(data.price),
      inStock: data.inStock,
      createdAt: data.createdAt,
      updatedAt: data.updatedAt,
    };
  }
}
