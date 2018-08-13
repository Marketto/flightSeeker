import { UserService } from '../../web-services/user/user.service';
import { AuthToken } from '../../classes/user/auth-token';
import { Component, OnInit } from '@angular/core';
import { AuthService } from '../../services/auth/auth.service';
import { Router } from '@angular/router';

const DEFAULT_ROUTE = ['/'];

@Component({
  selector: 'app-authorizing',
  templateUrl: './authorizing.component.html',
  styleUrls: ['./authorizing.component.scss']
})
export class AuthorizingComponent implements OnInit {

  constructor(
    private authService: AuthService,
    private userService: UserService,
    private router: Router
  ) { }

  ngOnInit() {
    this.authService.authenticate().toPromise().then(authData => {
      if (this.authService.isAuthenticated) {

        this.userService.addAccount(authData.auth).toPromise().then(() => {
          this.authService.setSession(authData.auth);
          this.router.navigate(authData.route || DEFAULT_ROUTE);
        }, () => {
          this.router.navigate(authData.route || DEFAULT_ROUTE);
        });

      } else {
        this.authService.setSession(authData.auth);
        this.router.navigate(authData.route || DEFAULT_ROUTE);
      }
    }, () => {
      this.router.navigate(['/']);
    });
  }

}
