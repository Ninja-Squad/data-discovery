import { TestBed } from '@angular/core/testing';
import { page } from 'vitest/browser';
import { beforeEach, describe, expect, test } from 'vitest';

import { MarkdownPageComponent } from './markdown-page.component';
import { ActivatedRoute } from '@angular/router';
import { environment } from '../../environments/environment';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { provideI18nTesting } from '../i18n/mock-18n';
import { provideConfiguredMarkdown } from '../markdown';
import { of } from 'rxjs';

class MarkdownPageComponentTester {
  readonly fixture = TestBed.createComponent(MarkdownPageComponent);
  readonly componentInstance = this.fixture.componentInstance;
  readonly heading = page.getByRole('heading', { level: 1 });
}

describe('MarkdownPageComponent', () => {
  let tester: MarkdownPageComponentTester;
  const fakeRoute = {
    data: of({ mdFile: environment.helpMdFile })
  };

  beforeEach(async () => {
    TestBed.configureTestingModule({
      providers: [
        provideHttpClientTesting(),
        provideI18nTesting(),
        provideConfiguredMarkdown(),
        { provide: ActivatedRoute, useValue: fakeRoute }
      ]
    });

    tester = new MarkdownPageComponentTester();
    await tester.fixture.whenStable();
  });

  test('should load and display the help file', async () => {
    const http = TestBed.inject(HttpTestingController);

    // the markdown file is extracted from the route data by our component
    expect(tester.componentInstance.mdFile()).toEqual('assets/help-en.md');

    // the markdown component requests the server for the file
    // we return a fake markdown with just a title
    http
      .expectOne({
        method: 'GET',
        url: 'assets/help-en.md'
      })
      .flush('# Help section');

    await tester.fixture.whenStable();

    // the markdown component should render the title
    await expect.element(tester.heading).toHaveTextContent('Help section');
  });
});
