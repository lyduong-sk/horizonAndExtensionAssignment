# GitHub Copilot Instructions: TypeScript Unit Test Generation

## Context
You are assisting in writing unit tests for TypeScript code, primarily using Jest as the testing framework.

## Guidelines for Generating Unit Tests

- Clearly follow Jest testing patterns: use `describe`, `it`, and `expect`.
- Test names should explicitly describe behavior, input conditions, and expected outcomes.
- **Important:** When generating tests, prioritize the behavior, examples, and sample data provided in the function comment above the implementation logic. If there's any conflict, always use the example provided in the comment as the correct expected outcome. This approach helps detect if the implementation deviates from documented specifications.
- Always generate tests that handle:
  - Happy case scenarios
  - Edge cases (e.g., null, undefined, empty inputs)
  - Error handling (e.g., exceptions, invalid inputs)
  - Mocking external dependencies (APIs, databases, file systems)

### Exception Handling Guidelines
- If a function is expected to throw an error for invalid inputs, generate test cases to verify the error is thrown.
- Use `expect(() => functionCall()).toThrow()` to test for exceptions.
- Include meaningful error messages in the function implementation and verify them in the test cases using `toThrowError`.

### Mocking Guidelines

- Use `jest.mock()` for mocking entire modules.
- Use `jest.fn()` for creating mock functions.
- Use `jest.spyOn()` to spy and optionally mock specific object methods.
- Ensure mocks clearly demonstrate expected calls and returned data.

## Example Template

Given a TypeScript module `calculator.ts`:

```typescript
export function add(a: number, b: number): number {
  return a + b;
}
```

Generate unit tests as follows in `calculator.test.ts`:

```typescript
import { add } from './calculator';

describe('add', () => {
  it('should correctly add two positive numbers', () => {
    expect(add(2, 3)).toBe(5);
  });

  it('should correctly handle negative numbers', () => {
    expect(add(-2, -3)).toBe(-5);
  });

  it('should return correct result when adding zero', () => {
    expect(add(0, 5)).toBe(5);
  });

  it('should throw an error if arguments are not numbers', () => {
    expect(() => add('a' as any, 'b' as any)).toThrow();
  });
});
```

## Example Template (with mocks)

Given a TypeScript module `userService.ts`:

```typescript
import { Database } from './database';

export async function getUserName(userId: string, db: Database): Promise<string> {
  const user = await db.getUser(userId);
  if (!user) {
    throw new Error('User not found');
  }
  return user.name;
}
```

Generate tests with mocks in `userService.test.ts`:

```typescript
import { getUserName } from './userService';
import { Database } from './database';

describe('getUserName', () => {
  const mockDb = {
    getUser: jest.fn(),
  } as unknown as Database;

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('returns user name when user exists', async () => {
    mockDb.getUser.mockResolvedValue({ name: 'Alice' });
    await expect(getUserName('123', mockDb)).resolves.toBe('Alice');
    expect(mockDb.getUser).toHaveBeenCalledWith('123');
  });

  it('throws an error if user is not found', async () => {
    mockDb.getUser.mockResolvedValue(null);
    await expect(getUserName('456', mockDb)).rejects.toThrowError('User not found');
    expect(mockDb.getUser).toHaveBeenCalledWith('456');
  });
});
```

## Clarified Example

Given the TypeScript function:

```typescript
/**
 * Returns the first N characters of the given string.
 *
 * @param input - The string to extract characters from.
 * @param numChars - The number of characters to extract.
 * @returns The first N characters from the input string.
 *
 * @example
 * truncateString("Hello, world!", 5);
 * // Expected output: "Hello"
 */
function truncateString(input: string, numChars: number): string {
  if (typeof input !== 'string') throw new Error('Input must be a string');
  if (typeof numChars !== 'number' || numChars < 0) {
    throw new Error('Number of characters must be a positive number');
  }
  return input.slice(0, numChars + 1); // intentionally incorrect implementation
}
```

Copilot should prioritize generating this test, aligning with the comment (output strictly following comment):

```typescript
describe('truncateString', () => {
  it('returns the first 5 characters as documented', () => {
    const result = truncateString("Hello, world!", 5);
    expect(result).toEqual("Hello"); // Align exactly with the comment example
  });
});
```

Even if the implementation uses incorrect logic (`numChars + 1`), the test must strictly follow the comment to detect the deviation immediately.
# GitHub Copilot Instructions: Code Testability Review

## Reviewing and Suggesting Improvements for Code to Be Testable

When I tell you **sked-review-testable**, you should suggest:

- Analyze the provided TypeScript code carefully and give your reviews following the rules below:

### **1. Dependency Injection**
Check if the class or function follows the dependency injection principle.

```typescript
// Before (less testable)
function getUser() {
  const db = new Database();
  return db.getUser();
}

// After (more testable)
function getUser(db: Database) {
  return db.getUser();
}
```

### **2. Modularize Large Functions**
Break down complex logic into smaller, focused functions.

```typescript
// Before (complex)
function processOrder(order) {
  validateOrder(order);
  calculateTotal(order);
  saveOrder(order);
}

// After (modular)
function processOrder(order) {
  validateOrder(order);
  const total = calculateTotal(order);
  saveOrder(order, total);
}
```

### **3. Avoid Hard-Coded Values**
Replace magic numbers or configurations with parameters or constants.

```typescript
// Before (hard-coded)
function isAdult(age) {
  return age >= 18; 
}

// After (parameterized)
const ADULT_AGE = 18;
function isAdult(age, adultAge = ADULT_AGE) {
  return age >= adultAge;
}
```

### **4. Minimize Side Effects**
Design functions to return outputs without directly modifying external states.

```typescript
// Before (side effect)
function saveUser(user) {
  fileSystem.write('user.txt', user);
}

// After (injected dependency)
function saveUser(user, writeFile) {
  writeFile('user.txt', user);
}
```

### **5. Function Documentation**
Always ensure the final refactored code includes function documentation with a description, expected input/output, and examples.

```typescript
/**
 * Selects a specified percentage of items from the beginning of an array.
 * 
 * @template T - The type of items in the array.
 * @param items - The array of items to select from.
 * @param percentage - The percentage of items to select (0 to 100).
 * @returns A new array containing the selected items.
 * 
 * @example
 * const items = [1, 2, 3, 4, 5];
 * const result = selectItemsByPercentage(items, 40);
 * // Expected output: [1, 2]
 */
function selectItemsByPercentage<T>(items: T[], percentage: number): T[] {
  if (percentage < 0 || percentage > 100) {
    throw new Error('Percentage must be between 0 and 100');
  }
  const numberOfItems = Math.ceil((items.length * percentage) / 100);
  return items.slice(0, numberOfItems);
}

export { selectItemsByPercentage };
```

---

### **Final Refactored Code**
The final refactored code **must always include function documentation** with a description, expected input/output, and examples.