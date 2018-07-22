import { UserService } from './../../web-services/user/user.service';
import { MenuItem } from 'primeng/api';
import { AuthService } from '../../services/auth/auth.service';
import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-menu-bar',
  templateUrl: './menu-bar.component.html',
  styleUrls: ['./menu-bar.component.scss']
})
export class MenuBarComponent implements OnInit {
  private $items: MenuItem[] = [
    {
      label: 'Liste',
      items: [
        {
          label: 'Nuova',
          icon: 'pi pi-plus',
        }
      ]
    },
    {
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

  constructor(
    private authService: AuthService,
    private userService: UserService
  ) {
    if (this.authService.isAuthenticated) {
      this.userService.read().subscribe(data=>{
        console.log(data);
      });
    }
  }

  ngOnInit() {
  }

}
