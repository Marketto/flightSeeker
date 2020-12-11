import { User } from './user';
import * as moment from 'moment-timezone';
import { Moment, Duration } from 'moment-timezone';
import { isString } from 'util';

export class AuthToken {
  public expiresAt: Moment;
  public accessToken: string;
  public idToken: string;
  public idTokenPayload: User;

  constructor(obj?: {
    expiresAt?: string | Moment | Date,
    expiresIn?: number,
    accessToken: string,
    idToken: string,
    idTokenPayload: Object | User | string
  }) {
    if (obj) {
      this.expiresAt = obj.expiresIn ? moment().add(obj.expiresIn, 'seconds') : moment(obj.expiresAt);
      this.accessToken = obj.accessToken;
      this.idToken = obj.idToken; 

      if (isString(obj.idTokenPayload)) {
        this.idTokenPayload = new User(JSON.parse(obj.idTokenPayload.toString()));
      } else {
        this.idTokenPayload = new User(obj.idTokenPayload);
      }
    }
  }
}
