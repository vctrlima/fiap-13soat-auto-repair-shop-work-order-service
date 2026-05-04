export class CustomerServiceAdapter {
  constructor(private readonly baseUrl: string) {}

  async getCustomerEmailById(customerId: string): Promise<string | undefined> {
    try {
      const response = await fetch(
        `${this.baseUrl}/internal/customers/id/${encodeURIComponent(customerId)}`,
      );
      if (!response.ok) return undefined;
      const body = (await response.json()) as { email?: string };
      return body.email;
    } catch {
      return undefined;
    }
  }
}
