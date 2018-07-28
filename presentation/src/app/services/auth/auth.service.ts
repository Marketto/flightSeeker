import { Injectable } from '@angular/core';
import { Observable, Observer } from 'rxjs';
import { Router, ActivatedRoute } from '@angular/router';
import * as auth0 from 'auth0-js';
import { HttpParams } from '@angular/common/http';
import * as moment from 'moment-timezone';
import { Moment } from 'moment';
import { User } from '../../classes/user/user';
import { AuthToken } from '../../classes/user/auth-token';


const redirectBaseUri = `${window.location.origin}/auth`;
const SOURCE_ROUTE_PARAM = 'origin';
const LOGOUT_ROUTE = '/';


@Injectable({
  providedIn: 'root'
})
export class AuthService {

  private $authToken: string;
  private $user: User;

  private webAuth = new auth0.WebAuth({
    responseType: 'token id_token',
    scope: [
      'openid',
      'profile'
    ].join(' '),
    redirectUri: redirectBaseUri,
    /* move to config*/
    clientID: 'qo4aVG9tl6tvPue6FCVOsD8xgd7AVcTe',
    domain: 'marketto.eu.auth0.com',
    audience: 'https://marketto.eu.auth0.com/userinfo'
  });

  constructor(
    private router: Router,
    private activeRoute: ActivatedRoute
  ) { }

  public login(): void {
    const redirectParams = (new HttpParams()).set(
      SOURCE_ROUTE_PARAM,
      this.router.url
    );

    this.webAuth.baseOptions.redirectUri = `${redirectBaseUri}?${redirectParams.toString()}`;

    this.webAuth.authorize();
  }


  public authenticate(): Observable<{auth?: AuthToken, route?: string[]}> {
    return Observable.create((observer: Observer<any>) => {
      const params = this.activeRoute.snapshot.queryParams;
      this.webAuth.parseHash((err, authResult) => {
        if (err) {
          console.warn(err);
          observer.error(err);
        } else {
          window.location.hash = '';
          observer.next({
            'auth': authResult ? new AuthToken(authResult) : undefined,
            'route': [params[SOURCE_ROUTE_PARAM]]
          });
        }
        observer.complete();
      });
    });
  }

  public setSession(authResult: AuthToken): void {
    // Set the time that the Access Token will expire at
    localStorage.setItem('access_token', authResult.accessToken);
    localStorage.setItem('id_token', authResult.idToken);
    localStorage.setItem('expires_at', authResult.expiresAt.toJSON());
    localStorage.setItem('user', JSON.stringify(authResult.idTokenPayload));
  }

  public get user(): User {
    if (this.isAuthenticated) {
      this.$user = this.$user || new User(JSON.parse(localStorage.getItem('user')));
      return this.$user;
    }
    return null;
  }

  public get authToken(): String {
    if (this.isAuthenticated) {
      this.$authToken = this.$authToken || localStorage.getItem('id_token');
      return this.$authToken;
    }
    return null;
  }

  public logout(): void {
    // Remove tokens and expiry time from localStorage
    localStorage.removeItem('access_token');
    localStorage.removeItem('id_token');
    localStorage.removeItem('expires_at');
    localStorage.removeItem('user');
    // Go back to the home route
    this.router.navigate([LOGOUT_ROUTE]);
  }

  public get isAuthenticated(): boolean {
    // Check whether the current time is past the
    // Access Token's expiry time
    const expiresAt: Moment = moment(localStorage.getItem('expires_at'));
    return expiresAt.isAfter();
  }
}
