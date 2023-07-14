import { Component } from '@angular/core';
import { environment } from '../../environments/environment';
import { RouterLink } from '@angular/router';
import { TranslateModule } from '@ngx-translate/core';
import {
  NgbCollapse,
  NgbDropdown,
  NgbDropdownMenu,
  NgbDropdownToggle
} from '@ng-bootstrap/ng-bootstrap';
import { NgFor, NgIf } from '@angular/common';

@Component({
  selector: 'dd-navbar',
  templateUrl: './navbar.component.html',
  styleUrls: ['./navbar.component.scss'],
  standalone: true,
  imports: [
    NgIf,
    NgbCollapse,
    NgFor,
    TranslateModule,
    NgbDropdown,
    NgbDropdownToggle,
    NgbDropdownMenu,
    RouterLink,
    environment.basketComponent
  ]
})
export class NavbarComponent {
  navbarCollapsed = true;
  navbar = environment.navbar;
  appName = environment.name;

  toggleNavbar() {
    this.navbarCollapsed = !this.navbarCollapsed;
  }

  hasSecondLogo() {
    return environment.navbar.secondLogoUrl;
  }
}
