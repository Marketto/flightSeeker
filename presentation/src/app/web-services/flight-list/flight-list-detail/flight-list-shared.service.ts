import { GenericWebServiceService } from '../../generic-web-service.service';
import { Observable } from '../../../../../node_modules/rxjs';


export class FlightListSharedService {
  private get resourceURI(): string {
    return `${this.serviceURI}/shared`;
  }

  public insert(userId: string = this.userId): Observable<void> {
    if (!userId) {
      throw Error('userId must be a valid string');
    }
    return this.genericWebService.insert<void>(
      `${this.resourceURI}/${userId}`
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
    private userId?: string
  ) {
    if (!serviceURI) {
      throw Error('serviceURI must be a valid string');
    }
  }
}
