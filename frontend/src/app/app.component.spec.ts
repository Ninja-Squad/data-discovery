import { TestBed } from '@angular/core/testing';

import { AppComponent } from './app.component';
import { ComponentTester } from 'ngx-speculoos';
import { provideI18nTesting } from './i18n/mock-18n.spec';
import { provideRouter } from '@angular/router';

describe('AppComponent', () => {
  beforeEach(() =>
    TestBed.configureTestingModule({
      providers: [provideI18nTesting(), provideRouter([])]
    })
  );

  it('should create the app', async () => {
    const tester = new ComponentTester(AppComponent);
    const app = tester.componentInstance;
    await tester.stable();
    expect(app).toBeTruthy();
  });
});
