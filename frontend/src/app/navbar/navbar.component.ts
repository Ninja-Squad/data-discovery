import { ChangeDetectionStrategy, Component, signal } from '@angular/core';
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
  ],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class NavbarComponent {
  readonly navbarCollapsed = signal(true);
  readonly navbar = environment.navbar;
  readonly appName = environment.name;

  toggleNavbar() {
    this.navbarCollapsed.update(collapsed => !collapsed);
  }

  hasSecondLogo() {
    return environment.navbar.secondLogoUrl;
  }
}
