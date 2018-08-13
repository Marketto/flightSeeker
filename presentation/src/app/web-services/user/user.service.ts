import { GenericWebServiceService } from '../generic-web-service.service';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { User } from '../../classes/user/user';
import { AuthToken } from '../../classes/user/auth-token';

@Injectable({
  providedIn: 'root'
})
export class UserService {

  private serviceURI = 'user';

  constructor(
    private genericWebService: GenericWebServiceService
  ) { }

  public read(): Observable<User> {

    return this.genericWebService.read<User>(
      this.serviceURI,
      (data) => new User(data)
    );
  }

  public addAccount(authToken: AuthToken = new AuthToken): Observable<void> {
    return this.genericWebService.insert<void>(
      `${this.serviceURI}/account`,
      {
        'token': authToken.idToken
      }
    );
  }
}
