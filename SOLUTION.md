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

- **What the new API test verifies:** The test sends `POST /tasks` with the same payload shape the app's client sends (`title`, `description`, `status`, `createdAt`). It checks that:
  - the response status is `201 Created`;
  - the response body has exactly the expected shape: a server-generated string `id` plus the submitted fields, with nothing missing or unexpected (matching the `Task` type in `app/src/types.ts`);
  - `title`, `description` and `status` match what was submitted;
  - the task is actually persisted (a follow-up `GET /tasks/:id` returns the same object).

  The test deletes the created task at the end so it doesn't affect other tests.

## Task D — Bug / usability / improvement report

### 1. Tasks are deleted immediately, with no confirmation or undo (usability)

- **What I observed:** Clicking the delete button removes the task instantly. There is no confirmation dialog and no way to undo.
- **Steps to reproduce:**
  1. Run the app (`npm run api`, `npm run dev`) and open http://localhost:5173.
  2. Click the delete button on any task (e.g. "Buy groceries").
  3. The task disappears immediately and is permanently removed from the API.
- **Why it matters:** Delete is a destructive, irreversible action, and the delete button sits right next to other row controls (edit, status). A single misclick causes permanent data loss, and the user has no way to recover the task.
- **Suggested fix or improvement:** Add a confirmation step before deleting (a modal like "Delete 'Buy groceries'? This can't be undone."), or show an "Undo" toast for a few seconds before the deletion is committed. Note: if a confirmation dialog is added, the existing `deleteTask()` helper in `TaskManagerPage.ts` would need to confirm it, and a new test could cover the "cancel" path to make sure the task is kept.

### 2. The API accepts invalid task data (improvement)

- **What I observed:** The form correctly blocks an empty or whitespace-only title ("Title is required"), but the API itself has no validation. A direct request creates a task with an empty title and a status that doesn't exist:
  `curl -X POST http://localhost:3001/tasks -H "Content-Type: application/json" -d '{"title":"","status":"Banana"}'`
  returns a created task `{ "title": "", "status": "Banana", "id": "..." }`, also without `description` or `createdAt`, which the `Task` type in `app/src/types.ts` requires.
- **Why it matters:** I understand json-server is a mock and isn't expected to validate. But in a real backend, client-side validation alone isn't enough: any other client, script or bug can write data that breaks the app's assumptions (an unknown status, a missing required field).
- **Suggested fix or improvement:** Validate on the server: require a non-empty trimmed `title`, restrict `status` to Open / In Progress / Done, and return `400 Bad Request` with a clear error message for invalid payloads. Once that exists, negative API tests should cover it (e.g. "POST /tasks with an empty title returns 400").

## Anything else you'd like us to know

-
