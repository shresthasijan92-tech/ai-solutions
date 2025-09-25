export type SecurityRuleContext = {
  path: string;
  operation: 'get' | 'list' | 'create' | 'update' | 'delete';
  requestResourceData?: any;
};

export class FirestorePermissionError extends Error {
  public context: SecurityRuleContext;

  constructor(context: SecurityRuleContext) {
    const message = `Firestore Permission Denied: You do not have permission to perform the '${context.operation}' operation on the path '${context.path}'.`;
    super(message);
    this.name = 'FirestorePermissionError';
    this.context = context;
    Object.setPrototypeOf(this, FirestorePermissionError.prototype);
  }

  toString(): string {
    return `${this.message}\n${JSON.stringify({ context: this.context }, null, 2)}`;
  }
}
