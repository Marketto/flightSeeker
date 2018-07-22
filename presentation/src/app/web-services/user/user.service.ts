import { GenericWebServiceService } from '../generic-web-service.service';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class UserService {

  constructor(
    private genericWebService: GenericWebServiceService
  ) { }

  public read(): Observable<any> {

    const serviceURI = `user`;

    return this.genericWebService.webService<any>(
      serviceURI,
      undefined
    );
  }
}
