import { FlightList } from '../../classes/flight-list/flight-list';
import { MenuItem } from 'primeng/api';
import { AuthService } from '../../services/auth/auth.service';
import { Component, OnInit } from '@angular/core';
import { FlightListService } from '../../web-services/flight-list/flight-list.service';

@Component({
  selector: 'app-menu-bar',
  templateUrl: './menu-bar.component.html',
  styleUrls: ['./menu-bar.component.scss']
})
export class MenuBarComponent implements OnInit {
  public newFlightListDialog: Boolean = false;
  private flightListMenu: MenuItem[] = [
    {
      label: 'New',
      icon: 'pi pi-plus',
      command: () => this.newFlightListDialog = true
    }
  ];
  private $loggedUserMenu: MenuItem[] = [
    {
      label: 'Search',
      icon: 'pi pi-search',
      routerLink: ['/'],
      styleClass: 'btn'
    },
    {
      id: 'FLIGHT_LISTS',
      label: 'Lists',
      items: this.flightListMenu
    },
    {
      id: 'USER',
      label: 'User',
      icon: 'pi pi-user',
      items: [
        {
          label: 'Add account',
          icon: 'pi pi-plus',
          command: () => this.authService.login()
        },
        {
          label: 'Logout',
          icon: 'pi pi-arrow-left',
          command: () => this.authService.logout()
        }
      ]
    }
  ];

  private $anonMenu: MenuItem[] = [
    {
      label: 'Search',
      icon: 'pi pi-search',
      routerLink: ['/'],
      styleClass: 'btn'
    },
    {
      label: 'Login',
      icon: 'pi pi-user',
      command: () => this.authService.login(),
      styleClass: 'btn'
    }
  ];

  public get userMenu(): MenuItem[] {
    return this.authService.isAuthenticated ? this.$loggedUserMenu : this.$anonMenu;
  }

  private login() {
    this.authService.login();
  }

  public addNewFlightList(flightList: FlightList): void {
    this.flightListMenu.push(this.flightListToMenuItem(flightList));
    this.newFlightListDialog = false;
  }

  private flightListToMenuItem(flightList: FlightList): { label: string, routerLink: string[]} {
    return {
      'label': flightList.name,
      'routerLink': ['/list', flightList.slug]
    };
  }

  constructor(
    private authService: AuthService,
    private flightListService: FlightListService
  ) {
    if (this.authService.isAuthenticated) {
      this.$loggedUserMenu.find(m => m.id === 'USER').label = this.authService.user.given_name;
      this.flightListService.readAll().then((list: FlightList[]) => {
        this.flightListMenu.splice(1);
        list.forEach((flightList: FlightList) => {
          this.flightListMenu.push(this.flightListToMenuItem(flightList));
        });
      });
    }
  }

  ngOnInit() {
  }

}
