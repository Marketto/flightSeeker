import { Injectable } from '@angular/core';
import { Observable, Observer } from 'rxjs';
import { Router, ActivatedRoute } from '@angular/router';
import * as auth0 from 'auth0-js';
import { HttpParams } from '@angular/common/http';
import * as moment from 'moment-timezone';
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
  private $authTokenExpirationTimeout: any;

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
  ) {
    const authToken = this.getSession();
    this.setToken(authToken);
  }

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

  public getSession(): AuthToken {
    return new AuthToken({
      expiresAt: localStorage.getItem('expires_at'),
      accessToken: localStorage.getItem('access_token'),
      idToken: localStorage.getItem('id_token'),
      idTokenPayload: localStorage.getItem('user')
    });
  }

  public setSession(authResult: AuthToken): void {
    localStorage.setItem('expires_at', authResult.expiresAt.toJSON());
    localStorage.setItem('access_token', authResult.accessToken);
    localStorage.setItem('id_token', authResult.idToken);
    localStorage.setItem('user', JSON.stringify(authResult.idTokenPayload));

    this.setToken(authResult);
  }

  private setToken(authToken: AuthToken) {
    this.$authToken = authToken.idToken;
    this.$user = authToken.idTokenPayload;

    if (authToken.expiresAt.isAfter()) {
      //Active token
      this.$authTokenExpirationTimeout = this.$authTokenExpirationTimeout || setTimeout(() => {
        this.destroyAuthSubscription();
      }, authToken.expiresAt.diff(moment(), 'milliseconds', true) + 1);
    } else {
      //Token expired
      this.destroyAuthSubscription();
    }
  }

  public get user(): User {
    return this.$user;
  }

  public get authToken(): string {
    return this.$authToken;
  }

  public get isAuthenticated(): boolean {
    return !!this.$authTokenExpirationTimeout;
  }

  public logout(): void {
    this.destroyAuthSubscription();
    // Go back to the home route
    this.router.navigate([LOGOUT_ROUTE]);
  }

  private destroyAuthSubscription() {
    // Remove tokens and expiry time from localStorage
    localStorage.removeItem('access_token');
    localStorage.removeItem('id_token');
    localStorage.removeItem('expires_at');
    localStorage.removeItem('user');
    this.$authToken = null;
    this.$user = null;
    if (this.$authTokenExpirationTimeout) {
      clearTimeout(this.$authTokenExpirationTimeout);
    }
    this.$authTokenExpirationTimeout = null;
  }

}
