import { GenericWebServiceService } from '../generic-web-service.service';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { User } from '../../classes/user/user';

@Injectable({
  providedIn: 'root'
})
export class UserService {

  constructor(
    private genericWebService: GenericWebServiceService
  ) { }

  public read(): Observable<User> {

    const serviceURI = `user`;

    return this.genericWebService.read<User>(
      serviceURI,
      (data) => new User(data)
    );
  }
}
