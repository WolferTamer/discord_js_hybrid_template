import { isStructuredError } from "@prisma/orm-mongo/utils";

/**
 * Base error class for throwing DB errors
 */
export class BaseError extends Error {
  constructor(message: string) {
    super(message);
    this.name = this.constructor.name;
  }
}

/**
 * DB error when a resource is not found when attempting to update
 */
export class NotFoundError extends BaseError {
  constructor(resource: string = "Resource") {
    super(`${resource} not found`);
  }
}

/**
 * DB error when a unique constraint is violated (e.g. user already has a document)
 */
export class UniqueConstraintError extends BaseError {
  constructor(public targetFields: string[]) {
    super(`A record with this ${targetFields.join(", ")} already exists`);
  }
}

/**
 * DB error when a foreign constraint is violated
 */
export class ForeignConstraintError extends BaseError {
  constructor(public relation: string) {
    super(`Related record for '${relation}' was not found`);
  }
}

/**
 * Generalized DB error
 */
export class DatabaseError extends BaseError {
  constructor(message: string = "Database operation failed") {
    super(message);
  }
}

export async function handleDbErrors<T>(
  operation: () => Promise<T>,
  entityName: string = "Record",
): Promise<T> {
  try {
    return await operation();
  } catch (error) {
    if (isStructuredError(error)) {
      switch (error.code) {
        case "DB.UNIQUE_VIOLATION": {
          // Unique constraint violation
          const targets = (error.meta?.target as string[]) || ["field"];
          throw new UniqueConstraintError(targets);
        }
        case "DB.RECORD_NOT_FOUND": {
          // Record to update/delete not found
          throw new NotFoundError(entityName);
        }
        case "DB.FOREIGN_KEY_VIOLATION": {
          // Foreign key failure
          const field = (error.meta?.field_name as string) || "foreign key";
          throw new ForeignConstraintError(field);
        }
        default:
          throw new DatabaseError(`Database request failed: ${error.code}`);
      }
    }

    if (error instanceof Error && "statusCode" in error) {
      throw error;
    }

    throw new DatabaseError("An unexpected database error occurred");
  }
}
