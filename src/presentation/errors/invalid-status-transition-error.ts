export class InvalidStatusTransitionError extends Error {
  constructor(currentStatus: string, targetStatus: string) {
    super(
      `Invalid status transition from '${currentStatus}' to '${targetStatus}'`,
    );
    this.name = "InvalidStatusTransitionError";
  }
}
