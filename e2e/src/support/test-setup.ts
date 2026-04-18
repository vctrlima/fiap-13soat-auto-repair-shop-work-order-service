import axios from "axios";

module.exports = async function () {
  const host = process.env.GATEWAY_HOST ?? "localhost";
  const port = process.env.GATEWAY_PORT ?? "8080";
  axios.defaults.baseURL = `http://${host}:${port}/api`;
};
