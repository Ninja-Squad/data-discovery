import { Routes } from '@angular/router';
import { HomeComponent } from './home/home.component';
import { SearchComponent } from './search/search.component';
import { HelpComponent } from './help/help.component';
import { AboutComponent } from "./about/about.component";
import { JoinComponent } from "./join/join.component";

export const routes: Routes = [
  { path: '', component: HomeComponent },
  { path: 'search', component: SearchComponent },
  { path: 'about', component: AboutComponent },
  { path: 'join', component: JoinComponent },
  { path: 'help', component: HelpComponent }
];
