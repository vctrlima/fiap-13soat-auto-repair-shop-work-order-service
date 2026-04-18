import { defineFeature, loadFeature } from "jest-cucumber";
import { resolve } from "node:path";
import { ApiClient, getErrorStatus } from "../helpers/api-client";
import {
  generateCustomerData,
  generatePartData,
  generateServiceData,
  generateVehicleData,
} from "../helpers/test-data";

const feature = loadFeature(
  resolve(__dirname, "../features/work-order-saga.feature"),
);

defineFeature(feature, (test) => {
  let client: ApiClient;

  test("Complete work order lifecycle - happy path", ({
    given,
    when,
    then,
    and,
  }) => {
    let customerId: string;
    let vehicleId: string;
    let serviceId: string;
    let partId: string;
    let workOrderId: string;

    given("the system is running with all microservices available", () => {
      client = new ApiClient();
    });

    given("a registered customer exists in the system", async () => {
      const customerData = generateCustomerData("individual");
      const res = await client.post("/customers", customerData);
      expect(res.status).toBe(201);
      customerId = res.data.id;
    });

    and("a vehicle is registered for that customer", async () => {
      const vehicleData = generateVehicleData(customerId);
      const res = await client.post("/vehicles", vehicleData);
      expect(res.status).toBe(201);
      vehicleId = res.data.id;
    });

    and("a service catalog item exists", async () => {
      const serviceData = generateServiceData();
      const res = await client.post("/services", serviceData);
      expect(res.status).toBe(201);
      serviceId = res.data.id;
    });

    and("a part or supply item exists", async () => {
      const partData = generatePartData();
      const res = await client.post("/parts-or-supplies", partData);
      expect(res.status).toBe(201);
      partId = res.data.id;
    });

    when(
      "I create a new work order with the customer, vehicle, service, and part",
      async () => {
        const res = await client.post("/work-orders", {
          customerId,
          vehicleId,
          serviceIds: [serviceId],
          partAndSupplyIds: [partId],
          status: "RECEIVED",
        });
        expect(res.status).toBe(201);
        workOrderId = res.data.id;
      },
    );

    then(
      /^the work order should be created with status "(.+)"$/,
      async (status) => {
        const res = await client.get(`/work-orders/${workOrderId}`);
        expect(res.data.status).toBe(status);
      },
    );

    when("I update the work order status through diagnosis", async () => {
      await client.put(`/work-orders/${workOrderId}`, {
        status: "IN_DIAGNOSIS",
      });
    });

    then(/^the work order should have status "(.+)"$/, async (status) => {
      const res = await client.get(`/work-orders/${workOrderId}`);
      expect(res.data.status).toBe(status);
    });

    when("I set the budget and move to waiting approval", async () => {
      await client.put(`/work-orders/${workOrderId}`, {
        status: "WAITING_APPROVAL",
        budget: 500,
      });
    });

    then(/^the work order should have status "(.+)"$/, async (status) => {
      const res = await client.get(`/work-orders/${workOrderId}`);
      expect(res.data.status).toBe(status);
    });

    when("I approve the work order", async () => {
      const res = await client.patch(`/work-orders/${workOrderId}/approve`);
      expect(res.status).toBe(200);
    });

    then(/^the work order should have status "(.+)"$/, async (status) => {
      const res = await client.get(`/work-orders/${workOrderId}`);
      expect(res.data.status).toBe(status);
    });

    and("a saga should be started for the work order", async () => {
      await sleep(2000);
      const res = await client.get(`/sagas/${workOrderId}`);
      expect(res.status).toBe(200);
      expect(res.data).toHaveProperty("status");
    });

    and("an invoice should be created for the work order", async () => {
      const res = await client.get(`/invoices/${workOrderId}`);
      expect(res.status).toBe(200);
      expect(res.data).toHaveProperty("invoiceId");
    });

    and("execution logs should be created for the work order", async () => {
      const res = await client.get(`/executions/${workOrderId}`);
      expect(res.status).toBe(200);
      expect(Array.isArray(res.data)).toBe(true);
    });
  });

  test("Process payment for an approved work order", ({
    given,
    when,
    then,
    and,
  }) => {
    let workOrderId: string;

    given("the system is running with all microservices available", () => {
      client = new ApiClient();
    });

    given("an approved work order with an invoice exists", async () => {
      const customer = generateCustomerData("individual");
      const custRes = await client.post("/customers", customer);
      const customerId = custRes.data.id;

      const vehicle = generateVehicleData(customerId);
      const vehRes = await client.post("/vehicles", vehicle);
      const vehicleId = vehRes.data.id;

      const service = generateServiceData();
      const svcRes = await client.post("/services", service);
      const serviceId = svcRes.data.id;

      const woRes = await client.post("/work-orders", {
        customerId,
        vehicleId,
        serviceIds: [serviceId],
        partAndSupplyIds: [],
        status: "RECEIVED",
      });
      workOrderId = woRes.data.id;

      await client.put(`/work-orders/${workOrderId}`, {
        status: "IN_DIAGNOSIS",
      });
      await client.put(`/work-orders/${workOrderId}`, {
        status: "WAITING_APPROVAL",
        budget: 300,
      });
      await client.patch(`/work-orders/${workOrderId}/approve`);

      await sleep(3000);
    });

    when("I process a payment for the invoice via PIX", async () => {
      const invoiceRes = await client.get(`/invoices/${workOrderId}`);
      const res = await client.post("/payments", {
        workOrderId,
        invoiceId: invoiceRes.data.invoiceId,
        amount: invoiceRes.data.amount,
        method: "PIX",
      });
      expect(res.status).toBe(201);
    });

    then("the payment should be completed successfully", async () => {
      const res = await client.get(`/payments/${workOrderId}`);
      expect(res.status).toBe(200);
      const payments = res.data;
      expect(payments.some((p: any) => p.status === "COMPLETED")).toBe(true);
    });

    and("the saga payment step should be marked as completed", async () => {
      await sleep(2000);
      const res = await client.get(`/sagas/${workOrderId}`);
      expect(res.data.status).toMatch(
        /PAYMENT_COMPLETED|EXECUTION_PENDING|EXECUTION_COMPLETED|SAGA_COMPLETED/,
      );
    });
  });

  test("Cancel a work order triggers compensation", ({
    given,
    when,
    then,
    and,
  }) => {
    let workOrderId: string;

    given("the system is running with all microservices available", () => {
      client = new ApiClient();
    });

    given(/^a work order exists with status "(.+)"$/, async (_status) => {
      const customer = generateCustomerData("individual");
      const custRes = await client.post("/customers", customer);
      const customerId = custRes.data.id;

      const vehicle = generateVehicleData(customerId);
      const vehRes = await client.post("/vehicles", vehicle);
      const vehicleId = vehRes.data.id;

      const service = generateServiceData();
      const svcRes = await client.post("/services", service);
      const serviceId = svcRes.data.id;

      const woRes = await client.post("/work-orders", {
        customerId,
        vehicleId,
        serviceIds: [serviceId],
        partAndSupplyIds: [],
        status: "RECEIVED",
      });
      workOrderId = woRes.data.id;

      await client.put(`/work-orders/${workOrderId}`, {
        status: "IN_DIAGNOSIS",
      });
      await client.put(`/work-orders/${workOrderId}`, {
        status: "WAITING_APPROVAL",
        budget: 200,
      });
      await client.patch(`/work-orders/${workOrderId}/approve`);
      await sleep(2000);
    });

    when("I cancel the work order", async () => {
      const res = await client.patch(`/work-orders/${workOrderId}/cancel`);
      expect(res.status).toBe(200);
    });

    then(/^the work order should have status "(.+)"$/, async (status) => {
      const res = await client.get(`/work-orders/${workOrderId}`);
      expect(res.data.status).toBe(status);
    });

    and("the saga should enter compensation flow", async () => {
      await sleep(3000);
      const res = await client.get(`/sagas/${workOrderId}`);
      expect(res.data.status).toMatch(/SAGA_COMPENSATING|SAGA_COMPENSATED/);
    });
  });

  test("Query saga state", ({ given, when, then }) => {
    let workOrderId: string;
    let sagaData: any;

    given("the system is running with all microservices available", () => {
      client = new ApiClient();
    });

    given("a work order with an active saga exists", async () => {
      const customer = generateCustomerData("individual");
      const custRes = await client.post("/customers", customer);
      const customerId = custRes.data.id;

      const vehicle = generateVehicleData(customerId);
      const vehRes = await client.post("/vehicles", vehicle);

      const service = generateServiceData();
      const svcRes = await client.post("/services", service);

      const woRes = await client.post("/work-orders", {
        customerId,
        vehicleId: vehRes.data.id,
        serviceIds: [svcRes.data.id],
        partAndSupplyIds: [],
        status: "RECEIVED",
      });
      workOrderId = woRes.data.id;

      await client.put(`/work-orders/${workOrderId}`, {
        status: "IN_DIAGNOSIS",
      });
      await client.put(`/work-orders/${workOrderId}`, {
        status: "WAITING_APPROVAL",
        budget: 100,
      });
      await client.patch(`/work-orders/${workOrderId}/approve`);
      await sleep(2000);
    });

    when("I query the saga state for the work order", async () => {
      const res = await client.get(`/sagas/${workOrderId}`);
      sagaData = res.data;
    });

    then("I should receive the current saga status and step history", () => {
      expect(sagaData).toHaveProperty("status");
      expect(sagaData).toHaveProperty("workOrderId", workOrderId);
    });
  });

  test("CRUD operations on customers", ({ given, when, then }) => {
    let customerDocument: string;
    let customerData: any;
    let createdCustomer: any;

    given("the system is running with all microservices available", () => {
      client = new ApiClient();
    });

    when("I create a new individual customer", async () => {
      customerData = generateCustomerData("individual");
      customerDocument = customerData.document;
      const res = await client.post("/customers", customerData);
      expect(res.status).toBe(201);
      createdCustomer = res.data;
    });

    then("the customer should be created successfully", () => {
      expect(createdCustomer).toHaveProperty("id");
      expect(createdCustomer.document).toBe(customerDocument);
    });

    when("I retrieve the customer by document", async () => {
      const res = await client.get(`/customers/${customerDocument}`);
      createdCustomer = res.data;
    });

    then("the customer data should match", () => {
      expect(createdCustomer.name).toBe(customerData.name);
      expect(createdCustomer.email).toBe(customerData.email);
    });

    when("I update the customer name", async () => {
      await client.patch(`/customers/${customerDocument}`, {
        name: "Updated E2E Name",
      });
    });

    then("the customer should be updated", async () => {
      const res = await client.get(`/customers/${customerDocument}`);
      expect(res.data.name).toBe("Updated E2E Name");
    });

    when("I delete the customer", async () => {
      const res = await client.delete(`/customers/${customerDocument}`);
      expect(res.status).toBe(204);
    });

    then("the customer should no longer exist", async () => {
      try {
        await client.get(`/customers/${customerDocument}`);
        fail("Expected 404");
      } catch (error) {
        expect(getErrorStatus(error)).toBe(404);
      }
    });
  });

  test("CRUD operations on vehicles", ({ given, when, then }) => {
    let customerId: string;
    let vehicleId: string;
    let vehicleData: any;
    let createdVehicle: any;

    given("the system is running with all microservices available", () => {
      client = new ApiClient();
    });

    given("a customer exists", async () => {
      const customerData = generateCustomerData("individual");
      const res = await client.post("/customers", customerData);
      customerId = res.data.id;
    });

    when("I create a new vehicle for the customer", async () => {
      vehicleData = generateVehicleData(customerId);
      const res = await client.post("/vehicles", vehicleData);
      expect(res.status).toBe(201);
      createdVehicle = res.data;
      vehicleId = res.data.id;
    });

    then("the vehicle should be created successfully", () => {
      expect(createdVehicle).toHaveProperty("id");
      expect(createdVehicle.licensePlate).toBe(vehicleData.licensePlate);
    });

    when("I retrieve the vehicle by id", async () => {
      const res = await client.get(`/vehicles/${vehicleId}`);
      createdVehicle = res.data;
    });

    then("the vehicle data should match", () => {
      expect(createdVehicle.brand).toBe(vehicleData.brand);
      expect(createdVehicle.model).toBe(vehicleData.model);
    });

    when("I update the vehicle brand", async () => {
      await client.put(`/vehicles/${vehicleId}`, {
        ...vehicleData,
        brand: "Honda",
      });
    });

    then("the vehicle should be updated", async () => {
      const res = await client.get(`/vehicles/${vehicleId}`);
      expect(res.data.brand).toBe("Honda");
    });

    when("I delete the vehicle", async () => {
      const res = await client.delete(`/vehicles/${vehicleId}`);
      expect(res.status).toBe(204);
    });

    then("the vehicle should no longer exist", async () => {
      try {
        await client.get(`/vehicles/${vehicleId}`);
        fail("Expected 404");
      } catch (error) {
        expect(getErrorStatus(error)).toBe(404);
      }
    });
  });
});

function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}
