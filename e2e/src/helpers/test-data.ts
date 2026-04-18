/**
 * Generates a valid CPF with correct check digits.
 */
export function generateCPF(): string {
  const randomDigits = Array.from({ length: 9 }, () =>
    Math.floor(Math.random() * 10),
  );
  const digit1 = calculateCPFDigit(randomDigits, 10);
  const digit2 = calculateCPFDigit([...randomDigits, digit1], 11);
  return [...randomDigits, digit1, digit2].join("");
}

function calculateCPFDigit(digits: number[], factor: number): number {
  const sum = digits.reduce(
    (acc, digit, index) => acc + digit * (factor - index),
    0,
  );
  const remainder = sum % 11;
  return remainder < 2 ? 0 : 11 - remainder;
}

/**
 * Generates a valid CNPJ with correct check digits.
 */
export function generateCNPJ(): string {
  const randomDigits = Array.from({ length: 12 }, () =>
    Math.floor(Math.random() * 10),
  );
  const digit1 = calculateCNPJDigit(
    randomDigits,
    [5, 4, 3, 2, 9, 8, 7, 6, 5, 4, 3, 2],
  );
  const digit2 = calculateCNPJDigit(
    [...randomDigits, digit1],
    [6, 5, 4, 3, 2, 9, 8, 7, 6, 5, 4, 3, 2],
  );
  return [...randomDigits, digit1, digit2].join("");
}

function calculateCNPJDigit(digits: number[], weights: number[]): number {
  const sum = digits.reduce(
    (acc, digit, index) => acc + digit * weights[index],
    0,
  );
  const remainder = sum % 11;
  return remainder < 2 ? 0 : 11 - remainder;
}

export function generateLicensePlate(): string {
  const letters = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
  return (
    letters[Math.floor(Math.random() * 26)] +
    letters[Math.floor(Math.random() * 26)] +
    letters[Math.floor(Math.random() * 26)] +
    Math.floor(Math.random() * 10) +
    Math.floor(Math.random() * 10) +
    Math.floor(Math.random() * 10) +
    Math.floor(Math.random() * 10)
  );
}

export function generateCustomerData(
  type: "individual" | "company" = "individual",
) {
  const ts = Date.now();
  return {
    document: type === "individual" ? generateCPF() : generateCNPJ(),
    name: `E2E Customer ${ts}`,
    email: `e2e.customer.${ts}@test.com`,
    phone: `11${Math.floor(Math.random() * 1e9)
      .toString()
      .padStart(9, "0")}`,
  };
}

export function generateVehicleData(customerId: string) {
  const ts = Date.now();
  return {
    customerId,
    licensePlate: generateLicensePlate(),
    brand: "Toyota",
    model: `E2E Model ${ts}`,
    year: new Date().getFullYear() - Math.floor(Math.random() * 5),
  };
}

export function generateServiceData() {
  const ts = Date.now();
  return {
    name: `E2E Service ${ts}`,
    description: `E2E service description ${ts}`,
    price: parseFloat((Math.random() * 500 + 100).toFixed(2)),
  };
}

export function generatePartData() {
  const ts = Date.now();
  return {
    name: `E2E Part ${ts}`,
    description: `E2E part description ${ts}`,
    price: parseFloat((Math.random() * 200 + 20).toFixed(2)),
    inStock: Math.floor(Math.random() * 50) + 5,
  };
}
