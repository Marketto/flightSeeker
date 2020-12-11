import * as moment from 'moment-timezone';
import { Moment, Duration } from 'moment-timezone';
import { UserSummary } from './user-summary';

export type Gender = 'male'|'female'|null;

export class User extends UserSummary {
  public at_hash: string;
  public aud: string;
  public exp: number;
  public family_name: string;
  public gender: Gender;
  public given_name: string;
  public iat: number;
  public locale: string;
  public nickname: string;
  public nonce: string;
  public picture: string;
  public sub: string;
  public updated_at: Moment;

  constructor(obj?: any) {
    super();
    if (obj) {
      this.at_hash = obj.at_hash;
      this.aud = obj.aud;
      this.exp = obj.exp;
      this.family_name = obj.family_name;
      this.gender = obj.gender;
      this.given_name = obj.given_name;
      this.iat = obj.iat;
      this.locale = obj.locale;
      this.nickname = obj.nickname;
      this.nonce = obj.nonce;
      this.picture = obj.picture;
      this.sub = obj.sub;
      this.updated_at = obj.updated_at ? moment(obj.updated_at) : undefined;
    }
  }
}
