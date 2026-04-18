import { PartOrSupplyMapper } from "@/infra/db/mappers/part-or-supply-mapper";
import { SagaStateMapper } from "@/infra/db/mappers/saga-state-mapper";
import { ServiceMapper } from "@/infra/db/mappers/service-mapper";
import { WorkOrderMapper } from "@/infra/db/mappers/work-order-mapper";

describe("PartOrSupplyMapper", () => {
  it("should map to domain", () => {
    const input = {
      id: "p-1",
      name: "Oil Filter",
      description: "Desc",
      price: 25,
      inStock: 10,
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    const result = PartOrSupplyMapper.toDomain(input as any);
    expect(result).toEqual(input);
  });
});

describe("ServiceMapper", () => {
  it("should map to domain", () => {
    const input = {
      id: "s-1",
      name: "Brake Service",
      description: "Desc",
      price: 100,
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    const result = ServiceMapper.toDomain(input as any);
    expect(result).toEqual(input);
  });
});

describe("SagaStateMapper", () => {
  it("should map to domain", () => {
    const input = {
      id: "sg-1",
      workOrderId: "wo-1",
      status: "STARTED",
      currentStep: "BILLING",
      compensationHistory: [
        {
          step: "BILLING",
          status: "completed",
          timestamp: new Date(),
          reason: "test",
        },
      ],
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    const result = SagaStateMapper.toDomain(input as any);
    expect(result.id).toBe("sg-1");
    expect(result.workOrderId).toBe("wo-1");
    expect(result.currentStep).toBe("BILLING");
    expect(result.compensationHistory).toHaveLength(1);
  });

  it("should default compensationHistory to empty array", () => {
    const input = {
      id: "sg-1",
      workOrderId: "wo-1",
      status: "STARTED",
      currentStep: "BILLING",
      compensationHistory: null,
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    const result = SagaStateMapper.toDomain(input as any);
    expect(result.compensationHistory).toEqual([]);
  });
});

describe("WorkOrderMapper", () => {
  it("should map to domain with services and parts", () => {
    const now = new Date();
    const input = {
      id: "wo-1",
      customerId: "c-1",
      vehicleId: "v-1",
      status: "RECEIVED",
      budget: 150,
      createdAt: now,
      updatedAt: now,
      services: [
        {
          id: "wos-1",
          workOrderId: "wo-1",
          serviceId: "s-1",
          quantity: 1,
          service: {
            id: "s-1",
            name: "Brake",
            description: "Desc",
            price: 100,
            createdAt: now,
            updatedAt: now,
          },
        },
      ],
      partsAndSupplies: [
        {
          id: "wop-1",
          workOrderId: "wo-1",
          partOrSupplyId: "p-1",
          quantity: 2,
          partOrSupply: {
            id: "p-1",
            name: "Oil",
            description: "Desc",
            price: 25,
            inStock: 5,
            createdAt: now,
            updatedAt: now,
          },
        },
      ],
    };
    const result = WorkOrderMapper.toDomain(input as any);
    expect(result.id).toBe("wo-1");
    expect(result.services).toHaveLength(1);
    expect(result.services[0].service?.name).toBe("Brake");
    expect(result.partsAndSupplies).toHaveLength(1);
    expect(result.partsAndSupplies[0].partOrSupply?.name).toBe("Oil");
  });

  it("should handle null service and partOrSupply", () => {
    const now = new Date();
    const input = {
      id: "wo-1",
      customerId: "c-1",
      vehicleId: "v-1",
      status: "RECEIVED",
      budget: 0,
      createdAt: now,
      updatedAt: now,
      services: [
        {
          id: "wos-1",
          workOrderId: "wo-1",
          serviceId: "s-1",
          quantity: 1,
          service: null,
        },
      ],
      partsAndSupplies: [
        {
          id: "wop-1",
          workOrderId: "wo-1",
          partOrSupplyId: "p-1",
          quantity: 1,
          partOrSupply: null,
        },
      ],
    };
    const result = WorkOrderMapper.toDomain(input as any);
    expect(result.services[0].service).toBeUndefined();
    expect(result.partsAndSupplies[0].partOrSupply).toBeUndefined();
  });
});
