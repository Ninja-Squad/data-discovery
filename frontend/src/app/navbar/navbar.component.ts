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

@Component({
    selector: 'dd-navbar',
    templateUrl: './navbar.component.html',
    styleUrl: './navbar.component.scss',
    imports: [
        NgbCollapse,
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
