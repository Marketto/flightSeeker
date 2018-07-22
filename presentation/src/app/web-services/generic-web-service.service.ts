import { AuthService } from '../services/auth/auth.service';
import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable, Observer } from 'rxjs';

export const API_RESOURCE: String = '/api';

export const DEFAULT_HTTP_HEADERS = {
  'Content-Type': 'application/json'
};


type HttpMethod = 'GET' | 'POST' | 'PUT' | 'DELETE';

@Injectable({
  providedIn: 'root'
})
export class GenericWebServiceService {

  private mergeBodies<ResourceType>(body: ResourceType) {
    return (responseData: any = {}) => {
      return Object.assign(body, responseData) as ResourceType;
    };
  }


  public search<ResourceType>(
    endPoint: string,
    params?: HttpParams,
    transformResponse?: Function
  ): Observable<ResourceType[]> {
    return this.webService<ResourceType[]>(
      endPoint,
      {
        method: 'GET',
        params: params
      },
      transformResponse
    );
  }

  public read<ResourceType>(
    endPoint: string,
    transformResponse?: Function
  ): Observable<ResourceType> {
    return this.webService(
      endPoint,
      {
        method: 'GET'
      },
      transformResponse
    );
  }

  public create<ResourceType>(
    endPoint: string,
    body?: ResourceType,
    transformResponse?: Function
  ): Observable<ResourceType> {
    return this.webService(
      endPoint,
      {
        method: 'POST',
        body: body
      },
      transformResponse || (body ? this.mergeBodies<ResourceType>(body) : undefined)
    );
  }

  public update<ResourceType>(
    endPoint: string,
    body: ResourceType,
    transformResponse?: Function
  ): Observable<ResourceType> {
    return this.webService(
      endPoint,
      {
        method: 'PUT',
        body: body
      },
      transformResponse || this.mergeBodies(body)
    );
  }

  public delete<ResourceType>(
    endPoint: string,
    transformResponse?: Function
  ): Observable<ResourceType> {
    return this.webService(
      endPoint,
      {
        method: 'DELETE'
      },
      transformResponse
    );
  }


  private webService<OutputType>(
    endPoint: string,
    config: {
      method: HttpMethod,
      params?: HttpParams,
      body?: OutputType
    } = {
      method: 'GET',
      params: undefined,
      body: undefined
    },
    transformResponse?: Function
  ): Observable<OutputType> {
    return Observable.create((observer: Observer<OutputType>) => {
      const authToken = this.authService.authToken;
      this.httpClient.request(config.method, `${API_RESOURCE}/${endPoint}`, {
        headers: new HttpHeaders({
          ...DEFAULT_HTTP_HEADERS,
          ...(authToken ? {
            'authorization': `Bearer ${authToken}`
          } : {})
        }),
        params: config.params,
        ...((config.method !== 'GET' && {'body': config.body}) || {})
      }).subscribe((data: any) => {
        if (transformResponse) {
          observer.next(transformResponse(data) as OutputType);
        } else {
          observer.next(data as OutputType);
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
