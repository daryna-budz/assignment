import { test, expect } from '@playwright/test';
import { TaskManagerPage } from '../pages/TaskManagerPage';

test.describe('Task status', () => {
  test('marking a task as Done updates its status badge', async ({ page }) => {
    const taskManager = new TaskManagerPage(page);
    await taskManager.goto();

    await taskManager.updateTaskStatus('Write report', 'Done');

    await expect(taskManager.taskStatusBadge('Write report')).toHaveText('Done');
  });

  test('marking a task as In Progress updates its status badge', async ({ page }) => {
    const taskManager = new TaskManagerPage(page);
    await taskManager.goto();

    await taskManager.updateTaskStatus('Plan team offsite', 'In Progress');

    await expect(taskManager.taskStatusBadge('Plan team offsite')).toHaveText('In Progress');
  });
});
