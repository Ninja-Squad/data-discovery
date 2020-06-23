import { ComponentFixture, TestBed } from '@angular/core/testing';

import { MarkdownPageComponent } from './markdown-page.component';
import { ActivatedRoute } from '@angular/router';
import { environment } from '../../environments/environment';
import { of } from 'rxjs';
import { MarkdownModule, MarkedOptions } from 'ngx-markdown';
import { HttpClient } from '@angular/common/http';
import { markedOptionsFactory } from '../app.module';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { fakeRoute } from 'ngx-speculoos';
import { I18nTestingModule } from '../i18n/i18n-testing.module.spec';

describe('MarkdownPageComponent', () => {
  let component: MarkdownPageComponent;
  let fixture: ComponentFixture<MarkdownPageComponent>;
  const route = fakeRoute({ data: of({ mdFile: environment.helpMdFile }) });

  beforeEach(() => TestBed.configureTestingModule({
    declarations: [MarkdownPageComponent],
    imports: [I18nTestingModule, HttpClientTestingModule, MarkdownModule.forRoot({
      loader: HttpClient, // optional, only if you use [src] attribute
      markedOptions: {
        provide: MarkedOptions,
        useFactory: markedOptionsFactory,
        useValue: {
          gfm: true, // default
          tables: true,
          breaks: false,
          pedantic: false,
          sanitize: false,
          smartLists: true,
          smartypants: false
        }
      }
    })],
    providers: [{ provide: ActivatedRoute, useValue: route }]
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(MarkdownPageComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should load and display the help file', () => {
    const http = TestBed.inject(HttpTestingController);

    // the markdown file is extracted from the route data by our component
    expect(component.mdFile).toEqual('assets/help-en.md');

    // the markdown component requests the server for the file
    // we return a fake markdown with just a title
    http.expectOne({
      method: 'GET',
      url: 'assets/help-en.md'
    }).flush('# Help section');

    // the markdown component should render the title
    const title = fixture.nativeElement.querySelector('h1').textContent;
    expect(title).toBe('Help section');
  });
});
