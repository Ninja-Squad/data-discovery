import { fakeAsync, TestBed, tick } from '@angular/core/testing';

import { MarkdownPageComponent } from './markdown-page.component';
import { ActivatedRoute } from '@angular/router';
import { environment } from '../../environments/environment';
import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { ComponentTester, stubRoute } from 'ngx-speculoos';
import { provideI18nTesting } from '../i18n/mock-18n.spec';
import { provideConfiguredMarkdown } from '../markdown';

class MarkdownPageComponentTester extends ComponentTester<MarkdownPageComponent> {
  constructor() {
    super(MarkdownPageComponent);
  }
}

describe('MarkdownPageComponent', () => {
  let tester: MarkdownPageComponentTester;
  const route = stubRoute({
    data: { mdFile: environment.helpMdFile }
  });

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        provideHttpClient(),
        provideHttpClientTesting(),
        provideI18nTesting(),
        provideConfiguredMarkdown(),
        { provide: ActivatedRoute, useValue: route }
      ]
    });

    tester = new MarkdownPageComponentTester();
    tester.detectChanges();
  });

  it('should load and display the help file', fakeAsync(() => {
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

    tick();
    tester.detectChanges();

    // the markdown component should render the title
    // no idea why using tester.element('h1') doesn't work
    expect(tester.nativeElement.querySelector('h1')?.textContent).toBe('Help section');
  }));
});
