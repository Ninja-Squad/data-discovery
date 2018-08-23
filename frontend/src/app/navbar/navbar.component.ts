import { Component } from '@angular/core';
import { environment } from '../../environments/environment';

@Component({
  selector: 'rare-navbar',
  templateUrl: './navbar.component.html',
  styleUrls: ['./navbar.component.scss']
})
export class NavbarComponent {

  navbarCollapsed = true;
  navbar = environment.navbar;

  toggleNavbar() {
    this.navbarCollapsed = !this.navbarCollapsed;
  }

}
