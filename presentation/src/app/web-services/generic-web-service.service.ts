import { AuthService } from '../services/auth/auth.service';
import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable, Observer } from 'rxjs';

export const API_RESOURCE: String = '/api';

export const DEFAULT_HTTP_HEADERS = {
  'Content-Type': 'application/json'
};

@Injectable({
  providedIn: 'root'
})
export class GenericWebServiceService {
  public webService<responseType>(
    endPoint: string,
    config: {params: HttpParams} = {params: undefined},
    transformResponse?: Function
  ): Observable<responseType> {
    return Observable.create((observer: Observer<responseType>) => {
      const authToken = this.authService.authToken;
      this.httpClient.get(`${API_RESOURCE}/${endPoint}`, {
        headers: new HttpHeaders({
          ...DEFAULT_HTTP_HEADERS,
          ...(authToken ? {
            'authorization': `Bearer ${authToken}`
          } : {})
        }),
        params: config.params
      }).subscribe((data: any) => {
        if (transformResponse) {
          observer.next(transformResponse(data) as responseType);
        } else {
          observer.next(data as responseType);
        }
        observer.complete();
      }, err => {
        observer.error(err);
      });
    });
  }
  constructor(
    private httpClient: HttpClient,
    private authService: AuthService
  ) { }
}
