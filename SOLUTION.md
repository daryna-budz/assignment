# Solution

## Task A — Root cause analysis

### Failing test 1: `Search › search filters the task list by title` (`tests/e2e/search.spec.ts`)

- **Root cause:** The `search()` method in `TaskManagerPage.ts` located the input with the test id `task-search-input`, which doesn't exist in the app. The real element in `app/src/components/SearchBar.tsx` has `data-testid="search-input"`, and the Page Object constructor already defines the correct locator (`this.searchInput`). The method ignored it and created a second, wrong locator, so `fill()` waited for an element that never appeared and timed out after 30s. The other search test ("clearing the search shows all tasks again") passed because it uses `taskManager.searchInput` directly instead of calling `search()`, which confirmed the issue was isolated to that one method.
- **Fix applied:** `search()` now reuses `this.searchInput` instead of creating its own locator. The locator is defined in one place, so the two can't drift apart again. The app itself was correct, so no app code was changed.

### Failing test 2: `Task status › marking a task as Done updates its status badge` (`tests/e2e/task-status.spec.ts`)

- **Root cause:** The test expected the status badge to read `"Completed"`, but the app correctly displays `"Done"`. The Playwright call log shows the badge changing from `Open` to `Done`, so the status update itself works. `"Completed"` does not appear anywhere in the app source (verified with `grep -rn "Completed" app/src`), while the README and the `TaskStatus` type define the statuses as Open, In Progress, and Done.
- **Fix applied:** Updated the expected text to `"Done"`. The assertion is still an exact `toHaveText` match against the spec-defined label, so it still meaningfully verifies the behavior rather than being loosened.

## Task B — New test

- **Scenario covered:** Searching for a term that matches no tasks shows the empty state. The test (`tests/e2e/search.spec.ts`) verifies that no task rows are rendered and that the "No tasks found." message is displayed. I added `emptyState` and `taskRows` locators to `TaskManagerPage` so the test uses the Page Object instead of raw selectors.
- **Why this scenario matters / why it was missing:** The existing search tests only cover the happy path and clearing the search. The "no results" edge case is common in real usage, and without a clear message users can't tell whether search failed or nothing matched. This test also exercises the `search()` method fixed in Task A, so a regression in that locator would now be caught.

## Task C — API validation

- **What the new API test verifies:**

## Task D — Bug / usability / improvement report

- **What I observed:**
- **Steps to reproduce (if applicable):**
- **Why it matters:**
- **Suggested fix or improvement:**

## Anything else you'd like us to know

-
