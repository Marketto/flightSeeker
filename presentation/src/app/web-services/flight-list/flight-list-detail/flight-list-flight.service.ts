import { GenericWebServiceService } from '../../generic-web-service.service';
import { Observable } from '../../../../../node_modules/rxjs';

export class FlightListFlightService {
  private get resourceURI(): string {
    return `${this.serviceURI}/flight`;
  }

  public insert(flightUuid: string = this.flightUUID): Observable<void> {
    if ( !flightUuid ) {
      throw Error('flightUuid must be a valid string');
    }
    return this.genericWebService.insert<void>(
      `${this.resourceURI}/${flightUuid}`
    );
  }

  public delete(flightUuid: string = this.flightUUID): Observable<void> {
    if ( !flightUuid ) {
      throw Error('flightUuid must be a valid string');
    }
    return this.genericWebService.delete<void>(
      `${this.resourceURI}/${flightUuid}`
    );
  }

  constructor(
    private genericWebService: GenericWebServiceService,
    private serviceURI: string,
    private flightUUID?: string
  ) {
    if (!serviceURI) {
      throw Error('serviceURI must be a valid string');
    }
  }
}
