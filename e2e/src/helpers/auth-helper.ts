import axios from "axios";

/**
 * Authenticates via CPF and returns a JWT access token.
 */
export async function authenticateWithCpf(cpf: string): Promise<string> {
  const response = await axios.post("/auth/cpf", { cpf });
  return response.data.accessToken;
}
