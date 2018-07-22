import { FlightList } from '../../classes/flight-list/flight-list';
import { MenuItem } from 'primeng/api';
import { AuthService } from '../../services/auth/auth.service';
import { Component, OnInit } from '@angular/core';
import { User } from '../../classes/user/user';
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
      label: 'Nuova',
      icon: 'pi pi-plus',
      command: () => this.newFlightListDialog = true
    }
  ];
  private $items: MenuItem[] = [
    {
      id: 'FLIGHT_LISTS',
      label: 'Liste',
      items: this.flightListMenu
    },
    {
      id: 'USER',
      label: 'User',
      icon: 'pi pi-user',
      items: [
        {
          label: 'Logout',
          icon: 'pi pi-power-off',
          command: () => this.authService.logout()
        }
      ]
    }
  ];

  public get items(): MenuItem[] {
    if (this.authService.isAuthenticated) {
      return this.$items;
    }
    return null;
  }

  public get authenticated() {
    return this.authService.isAuthenticated;
  }

  public login() {
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
    const user: User = this.authService.user;
    if (user) {
      this.$items.find(m => m.id === 'USER').label = this.authService.user.given_name;
      this.flightListService.readAll().subscribe((list: FlightList[]) => {
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
