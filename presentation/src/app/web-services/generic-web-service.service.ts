import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class GenericWebServiceService {
  public webService(observable: Observable<any>, config: any = {}) {
    return Observable.create(observer => {
      observable.subscribe((data: any) => {
        observer.next(data);
      }, err => {
        observer.error(err);
      });
    });
  }
  constructor() { }
}

export const API_RESOURCE: String = '/api';
