import { TestBed } from '@angular/core/testing';
import { RouterTestingModule } from '@angular/router/testing';
import { HttpClientTestingModule } from '@angular/common/http/testing';

import { AppComponent } from './app.component';
import { ErrorComponent } from './error/error.component';
import { NavbarComponent } from './navbar/navbar.component';
import { I18nTestingModule } from './i18n/i18n-testing.module.spec';
import { ComponentTester } from 'ngx-speculoos';

describe('AppComponent', () => {
  beforeEach(() =>
    TestBed.configureTestingModule({
      imports: [RouterTestingModule, HttpClientTestingModule, I18nTestingModule],
      declarations: [AppComponent, ErrorComponent, NavbarComponent]
    })
  );

  it('should create the app', () => {
    const tester = new ComponentTester(AppComponent);
    const app = tester.componentInstance;
    expect(app).toBeTruthy();
  });
});
