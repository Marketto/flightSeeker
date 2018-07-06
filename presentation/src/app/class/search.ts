import { HttpParams } from '@angular/common/http';
export abstract class Search {
  public toHttpParams() {
    let params = new HttpParams();

    Object.keys(this).forEach(key => {
      const param = key.replace(/^\$/, '');
      if (this[param]) {
        params = params.set(param, this[param]);
      }
    });

    return params;
  }
}
