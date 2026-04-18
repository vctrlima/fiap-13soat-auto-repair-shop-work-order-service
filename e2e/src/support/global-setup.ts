import * as net from "net";

function waitForPortOpen(
  port: number,
  options: { host?: string; timeout?: number } = {},
): Promise<void> {
  const { host = "localhost", timeout = 30000 } = options;
  const start = Date.now();

  return new Promise((resolve, reject) => {
    const tryConnect = () => {
      const socket = net.createConnection({ port, host }, () => {
        socket.destroy();
        resolve();
      });

      socket.on("error", () => {
        socket.destroy();
        if (Date.now() - start >= timeout) {
          reject(new Error(`Timeout waiting for port ${port} on ${host}`));
        } else {
          setTimeout(tryConnect, 500);
        }
      });
    };

    tryConnect();
  });
}

module.exports = async function () {
  console.log("\n[E2E] Setting up — waiting for services...\n");

  const gatewayHost = process.env.GATEWAY_HOST ?? "localhost";
  const gatewayPort = process.env.GATEWAY_PORT
    ? Number(process.env.GATEWAY_PORT)
    : 8080;
  await waitForPortOpen(gatewayPort, { host: gatewayHost });

  console.log(`[E2E] API Gateway is ready at ${gatewayHost}:${gatewayPort}\n`);
};
