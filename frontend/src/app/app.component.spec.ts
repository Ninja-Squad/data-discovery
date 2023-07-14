import { TestBed } from '@angular/core/testing';

import { AppComponent } from './app.component';
import { ComponentTester } from 'ngx-speculoos';
import { provideI18nTesting } from './i18n/mock-18n.spec';

describe('AppComponent', () => {
  beforeEach(() =>
    TestBed.configureTestingModule({
      providers: [provideI18nTesting()]
    })
  );

  it('should create the app', () => {
    const tester = new ComponentTester(AppComponent);
    const app = tester.componentInstance;
    expect(app).toBeTruthy();
  });
});
