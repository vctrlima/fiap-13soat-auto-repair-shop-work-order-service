jest.mock("@/infra/observability", () => ({
  messageConsumedCounter: { add: jest.fn() },
  messageProcessingFailedCounter: { add: jest.fn() },
  logger: {
    info: jest.fn(),
    warn: jest.fn(),
    error: jest.fn(),
    debug: jest.fn(),
    child: jest.fn().mockReturnThis(),
  },
}));

const mockSend = jest.fn();
jest.mock("@aws-sdk/client-sqs", () => ({
  SQSClient: jest.fn().mockImplementation(() => ({ send: mockSend })),
  ReceiveMessageCommand: jest
    .fn()
    .mockImplementation((params) => ({ ...params, _type: "receive" })),
  DeleteMessageCommand: jest
    .fn()
    .mockImplementation((params) => ({ ...params, _type: "delete" })),
}));

import { SqsEventConsumer } from "@/infra/messaging/sqs-event-consumer";

describe("SqsEventConsumer", () => {
  const handler = jest.fn().mockResolvedValue(undefined);

  beforeEach(() => {
    jest.clearAllMocks();
    mockSend.mockReset();
  });

  it("should create consumer with endpoint", () => {
    const sut = new SqsEventConsumer(
      "http://queue",
      "us-east-2",
      handler,
      "http://localhost:4566",
    );
    expect(sut).toBeDefined();
  });

  it("should start and stop polling", async () => {
    mockSend.mockResolvedValue({ Messages: undefined });
    const sut = new SqsEventConsumer("http://queue", "us-east-2", handler);

    // Start polling then stop immediately
    await sut.start();
    await sut.stop();
  });

  it("should process messages and delete them", async () => {
    const event = { eventType: "WorkOrderCreated", source: "test", data: {} };
    let callCount = 0;
    mockSend.mockImplementation(() => {
      callCount++;
      if (callCount === 1) {
        return Promise.resolve({
          Messages: [
            {
              Body: JSON.stringify({ Message: JSON.stringify(event) }),
              ReceiptHandle: "receipt-1",
            },
          ],
        });
      }
      return Promise.resolve({ Messages: undefined });
    });

    const sut = new SqsEventConsumer("http://queue", "us-east-2", handler);
    await sut.start();

    // Give time for first poll iteration
    await new Promise((r) => setTimeout(r, 50));
    await sut.stop();

    expect(handler).toHaveBeenCalledWith(event);
  });

  it("should handle direct body (no Message wrapper)", async () => {
    const event = { eventType: "WorkOrderCreated", source: "test", data: {} };
    let callCount = 0;
    mockSend.mockImplementation(() => {
      callCount++;
      if (callCount === 1) {
        return Promise.resolve({
          Messages: [
            { Body: JSON.stringify(event), ReceiptHandle: "receipt-1" },
          ],
        });
      }
      return Promise.resolve({ Messages: undefined });
    });

    const sut = new SqsEventConsumer("http://queue", "us-east-2", handler);
    await sut.start();
    await new Promise((r) => setTimeout(r, 50));
    await sut.stop();

    expect(handler).toHaveBeenCalledWith(event);
  });

  it("should handle message without ReceiptHandle", async () => {
    const event = { eventType: "Test", source: "test", data: {} };
    let callCount = 0;
    mockSend.mockImplementation(() => {
      callCount++;
      if (callCount === 1) {
        return Promise.resolve({
          Messages: [{ Body: JSON.stringify(event) }],
        });
      }
      return Promise.resolve({ Messages: undefined });
    });

    const sut = new SqsEventConsumer("http://queue", "us-east-2", handler);
    await sut.start();
    await new Promise((r) => setTimeout(r, 50));
    await sut.stop();

    expect(handler).toHaveBeenCalledWith(event);
  });

  it("should handle message processing errors", async () => {
    handler.mockRejectedValueOnce(new Error("handler error"));
    let callCount = 0;
    mockSend.mockImplementation(() => {
      callCount++;
      if (callCount === 1) {
        return Promise.resolve({
          Messages: [
            {
              Body: JSON.stringify({
                eventType: "Test",
                source: "test",
                data: {},
              }),
              ReceiptHandle: "r-1",
            },
          ],
        });
      }
      return Promise.resolve({ Messages: undefined });
    });

    const sut = new SqsEventConsumer("http://queue", "us-east-2", handler);
    await sut.start();
    await new Promise((r) => setTimeout(r, 50));
    await sut.stop();

    const { logger } = jest.requireMock("@/infra/observability");
    expect(logger.error).toHaveBeenCalled();
  });

  it("should handle polling errors", async () => {
    mockSend
      .mockRejectedValueOnce(new Error("network error"))
      .mockResolvedValue({ Messages: undefined });

    const sut = new SqsEventConsumer("http://queue", "us-east-2", handler);
    await sut.start();
    await new Promise((r) => setTimeout(r, 50));
    await sut.stop();

    const { logger } = jest.requireMock("@/infra/observability");
    expect(logger.error).toHaveBeenCalled();
  });
});
