const mockPoolInstance = {
  on: jest.fn(),
  connect: jest.fn(),
};

const mockExecute = jest.fn();
const MockPool = jest.fn(() => mockPoolInstance);

jest.mock("pg", () => ({ Pool: MockPool }));

jest.mock("@/infra/circuit-breaker", () => ({
  databaseCircuitBreaker: { execute: mockExecute },
}));

jest.mock("@prisma/adapter-pg", () => ({ PrismaPg: jest.fn() }));
jest.mock("@/generated/prisma/client", () => ({ PrismaClient: jest.fn() }));

describe("prisma-client", () => {
  const originalEnv = process.env;

  beforeEach(() => {
    jest.clearAllMocks();
    process.env = {
      ...originalEnv,
      DATABASE_URL: "postgresql://localhost/test",
    };
    delete process.env.DB_POOL_MAX;
  });

  afterAll(() => {
    process.env = originalEnv;
  });

  it("should create a Pool with correct configuration", () => {
    jest.isolateModules(() => {
      require("@/infra/db/prisma-client");
    });

    expect(MockPool).toHaveBeenCalledWith(
      expect.objectContaining({
        connectionString: "postgresql://localhost/test",
        max: 10,
        idleTimeoutMillis: 30000,
        connectionTimeoutMillis: 5000,
      }),
    );
  });

  it("should respect DB_POOL_MAX environment variable", () => {
    process.env.DB_POOL_MAX = "25";

    jest.isolateModules(() => {
      require("@/infra/db/prisma-client");
    });

    expect(MockPool).toHaveBeenCalledWith(expect.objectContaining({ max: 25 }));
  });

  it("should register an error handler on the pool", () => {
    jest.isolateModules(() => {
      require("@/infra/db/prisma-client");
    });

    expect(mockPoolInstance.on).toHaveBeenCalledWith(
      "error",
      expect.any(Function),
    );
  });

  it("should wrap pool.connect through the circuit breaker", async () => {
    const mockClient = { query: jest.fn() };
    const originalConnectFn = jest.fn().mockResolvedValue(mockClient);
    mockPoolInstance.connect = originalConnectFn;
    mockExecute.mockImplementation((fn: () => Promise<any>) => fn());

    jest.isolateModules(() => {
      require("@/infra/db/prisma-client");
    });

    const patchedConnect = mockPoolInstance.connect;
    await patchedConnect();
    expect(mockExecute).toHaveBeenCalled();
  });

  it("should wrap client.query through the circuit breaker after connect", async () => {
    const mockQuery = jest.fn().mockResolvedValue({ rows: [{ id: 1 }] });
    const mockClient = { query: mockQuery };
    const originalConnectFn = jest.fn().mockResolvedValue(mockClient);
    mockPoolInstance.connect = originalConnectFn;
    mockExecute.mockImplementation((fn: () => Promise<any>) => fn());

    jest.isolateModules(() => {
      require("@/infra/db/prisma-client");
    });

    const patchedConnect = mockPoolInstance.connect;
    const client = await patchedConnect();
    await client.query("SELECT 1");
    expect(mockExecute).toHaveBeenCalledTimes(2);
  });
});
