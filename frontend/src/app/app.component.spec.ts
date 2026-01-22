import { TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { beforeEach, describe, expect, test } from 'vitest';

import { AppComponent } from './app.component';
import { provideI18nTesting } from './i18n/mock-18n';

class AppComponentTester {
  readonly componentInstance = TestBed.createComponent(AppComponent).componentInstance;
}

describe('AppComponent', () => {
  beforeEach(() =>
    TestBed.configureTestingModule({
      providers: [provideI18nTesting(), provideRouter([])]
    })
  );

  test('should create the app', async () => {
    const tester = new AppComponentTester();
    const app = tester.componentInstance;
    expect(app).toBeTruthy();
  });
});
