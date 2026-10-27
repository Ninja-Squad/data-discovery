import { TestBed } from '@angular/core/testing';
import { beforeEach, describe, expect, test } from 'vitest';
import { page } from 'vitest/browser';
import { GenericSelectAllResultsComponent } from './generic-select-all-results.component';

describe('GenericSelectAllResultsComponent', () => {
  beforeEach(() => TestBed.configureTestingModule({}));
  test('should be empty', async () => {
    const fixture = TestBed.createComponent(GenericSelectAllResultsComponent);
    await fixture.whenStable();
    const root = page.elementLocator(fixture.nativeElement);
    await expect.element(root).toHaveTextContent('');
  });
});
