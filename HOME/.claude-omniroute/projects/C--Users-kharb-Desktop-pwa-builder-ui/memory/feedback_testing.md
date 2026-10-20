---
name: feedback_testing
description: guidance for fixing a variety of testing types
---

**Rule:** Always fix code mismatches between production and test expectations.

**Why:** These mismatches cause flaky tests that switch from passing to failing at random, create hidden bugs, and increase maintenance overhead.

**How to apply:** After fixing code in src/, also update test files in src/__tests__/ (or app/__tests__, or whichever directory is used for tests in this repo). If tests are in separate spec files (e.g., *.spec.ts), update those too.

**Examples:**
- If testing changes to a hook’s return value, ensure the new output matches the hook’s actual return type.
- If testing a component’s props expectations, update tests to reflect the new prop constraints.
- If modifying validation rules in code, update test cases to match the new validation logic.
- If changing a helper’s implementation, update test helper expectations accordingly.
- If fixing bugs in production logic, verify the tests cover the bug scenarios.

**Edge cases:**
- If no corresponding test file exists, create a minimal test covering the changed functionality.
- If tests fail due to mismatched expectations but the new implementation is correct, update test expectations to match.
- If the code change introduces new behavior not covered by tests, add new test cases.
- Keep updates synchronized: make identical changes across all test files that reference the same code or test the same behavior.
- When updating test expectations, ensure test edge cases remain comprehensive.
- If fixing multiple files with the same underlying issue, batch updates and run tests once to validate consistency.
- If a test file contains multiple test cases but only one needs updating, target that specific case while preserving others.
- Avoid breaking existing test suite: after updating expectations, verify all tests pass before committing changes.