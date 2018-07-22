import { Component, OnInit } from '@angular/core';
import { AuthService } from '../../services/auth/auth.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-authorizing',
  templateUrl: './authorizing.component.html',
  styleUrls: ['./authorizing.component.scss']
})
export class AuthorizingComponent implements OnInit {

  constructor(
    private authService: AuthService,
    private router: Router
  ) { }

  ngOnInit() {
    this.authService.authenticate().subscribe(route => {
      this.router.navigate([route]);
    }, () => {
      this.router.navigate(['/']);
    });
  }

}
