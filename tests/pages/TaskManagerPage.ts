import { Page, Locator, expect } from '@playwright/test';

export type TaskStatus = 'Open' | 'In Progress' | 'Done';

export interface TaskFormData {
  title?: string;
  description?: string;
  status?: TaskStatus;
}

/**
 * Page Object for the Task Manager app.
 * Centralizes locators and common user flows so tests stay readable
 * and resilient to small markup changes.
 */
export class TaskManagerPage {
  readonly page: Page;
  readonly newTaskButton: Locator;
  readonly searchInput: Locator;
  readonly formModal: Locator;
  readonly emptyState: Locator;
  readonly taskRows: Locator;

  constructor(page: Page) {
    this.page = page;
    this.newTaskButton = page.getByTestId('new-task-btn');
    this.searchInput = page.getByTestId('search-input');
    this.formModal = page.getByTestId('task-form-modal');
    this.emptyState = page.getByTestId("empty-state");
    this.taskRows = page.locator('[data-testid^="task-item-"]');
  }

  async goto() {
    await this.page.goto('/');
    await expect(this.page.getByTestId('task-list').or(this.page.getByTestId('empty-state'))).toBeVisible();
  }

  /** Returns the row locator for a task, matched by its visible title text. */
  taskRow(title: string): Locator {
    return this.page.locator('[data-testid^="task-item-"]').filter({ hasText: title });
  }

  taskStatusBadge(title: string): Locator {
    return this.taskRow(title).getByTestId('task-status-badge');
  }

  async openNewTaskForm() {
    await this.newTaskButton.click();
    await expect(this.formModal).toBeVisible();
  }

  async fillTaskForm(data: TaskFormData) {
    if (data.title !== undefined) {
      await this.page.getByTestId('form-title-input').fill(data.title);
    }
    if (data.description !== undefined) {
      await this.page.getByTestId('form-description-input').fill(data.description);
    }
    if (data.status !== undefined) {
      await this.page.getByTestId('form-status-select').selectOption(data.status);
    }
  }

  async submitForm() {
    await this.page.getByTestId('form-submit-btn').click();
  }

  async createTask(title: string, description: string, status: TaskStatus = 'Open') {
    await this.openNewTaskForm();
    await this.fillTaskForm({ title, description, status });
    await this.submitForm();
    await expect(this.taskRow(title)).toBeVisible();
  }

  async editTask(currentTitle: string, updates: TaskFormData) {
    await this.taskRow(currentTitle).getByTestId('task-edit-btn').click();
    await expect(this.formModal).toBeVisible();
    await this.fillTaskForm(updates);
    await this.submitForm();
  }

  async deleteTask(title: string) {
    await this.taskRow(title).getByTestId('task-delete-btn').click();
    await expect(this.taskRow(title)).toHaveCount(0);
  }

  /** Changes a task's status via its inline status dropdown (no need to open the edit form). */
  async updateTaskStatus(title: string, status: TaskStatus) {
    await this.taskRow(title).getByTestId('task-status-select').selectOption(status);
  }

  async search(term: string) {
    await this.searchInput.fill(term);
  }
}
