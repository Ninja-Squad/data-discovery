import { Routes } from '@angular/router';
import { HomeComponent } from './home/home.component';
import { SearchComponent } from './search/search.component';
import { MarkdownPageComponent } from './markdown-page/markdown-page.component';
import { environment } from '../environments/environment';

export const routes: Routes = [
  { path: '', component: HomeComponent },
  { path: 'search', component: SearchComponent },
  { path: 'about', component: MarkdownPageComponent, data: { mdFile: environment.aboutUsMdFile } },
  { path: 'join', component: MarkdownPageComponent, data: { mdFile: environment.joinUsMdFile } },
  { path: 'legal', component: MarkdownPageComponent, data: { mdFile: environment.legalMentionsMdFile } },
  { path: 'help', component: MarkdownPageComponent, data: { mdFile: environment.helpMdFile } },
];
