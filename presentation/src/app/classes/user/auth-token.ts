import { User } from './user';
import { Moment } from 'moment';
import * as moment from 'moment-timezone';

export class AuthToken {
  public expiresAt: Moment;
  public accessToken: string;
  public idToken: string;
  public idTokenPayload: User;

  constructor(obj?: any) {
    if (obj) {
      this.expiresAt = obj.expiresIn ? moment().add(obj.expiresIn, 'seconds') : moment(obj.expiresAt);
      this.accessToken = obj.accessToken;
      this.idToken = obj.idToken;
      this.idTokenPayload = new User(obj.idTokenPayload);
    }
  }
}
