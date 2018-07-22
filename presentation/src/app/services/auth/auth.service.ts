import { Injectable } from '@angular/core';
import { Observable, Observer } from 'rxjs';
import { Router, ActivatedRoute } from '@angular/router';
import * as auth0 from 'auth0-js';
import { HttpParams } from '@angular/common/http';
import * as moment from 'moment';
import { Moment } from 'moment';


const redirectBaseUri = `${window.location.origin}/auth`;
const SOURCE_ROUTE_PARAM = 'origin';
const LOGOUT_ROUTE = '/';


@Injectable({
  providedIn: 'root'
})
export class AuthService {

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


  public authenticate(): Observable<String> {
    return Observable.create((observer: Observer<any>) => {
      const params = this.activeRoute.snapshot.queryParams;
      this.webAuth.parseHash((err, authResult) => {
        if (err) {
          console.warn(err);
          observer.error(err);
        } else {
          if (authResult && authResult.accessToken && authResult.idToken) {
            window.location.hash = '';
            this.setSession(authResult);
          }
          observer.next(params[SOURCE_ROUTE_PARAM]);
          observer.complete();
        }
      });
    });
  }


  private setSession(authResult): void {
    // Set the time that the Access Token will expire at
    const expiresAt = moment().add(authResult.expiresIn, 'seconds').toJSON();
    localStorage.setItem('access_token', authResult.accessToken);
    localStorage.setItem('id_token', authResult.idToken);
    localStorage.setItem('expires_at', expiresAt);
  }

  public get authToken(): String {
    const token = localStorage.getItem('id_token');
    if (this.isAuthenticated && token) {
      return token;
    }
  }

  public logout(): void {
    // Remove tokens and expiry time from localStorage
    localStorage.removeItem('access_token');
    localStorage.removeItem('id_token');
    localStorage.removeItem('expires_at');
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
