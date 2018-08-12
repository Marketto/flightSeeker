import { Injectable } from '@angular/core';
import { Observable } from '../../../../../node_modules/rxjs';
import { GenericWebServiceService } from '../../generic-web-service.service';

@Injectable({
  providedIn: 'root'
})
export class FlightListShareRequestService {
  private get resourceURI(): string {
    return `${this.serviceURI}/shareRequest`;
  }


  public create(): Observable<void> {
    return this.genericWebService.create<void>(
      `${this.resourceURI}`
    );
  }

  public delete(userId: string = this.userId): Observable<void> {
    if (!userId) {
      throw Error('userId must be a valid string');
    }
    return this.genericWebService.delete<void>(
      `${this.resourceURI}/${userId}`
    );
  }

  constructor(
    private genericWebService: GenericWebServiceService,
    private serviceURI: string,
    private userId: string
  ) {
    if (!serviceURI) {
      throw Error('serviceURI must be a valid string');
    }
  }
}
