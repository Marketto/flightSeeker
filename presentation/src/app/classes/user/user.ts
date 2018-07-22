import { Moment } from 'moment-timezone';
import * as moment from 'moment-timezone';

export type Gender = 'male'|'female'|null;

export class User {
  public at_hash: string;
  public aud: string;
  public exp: number;
  public family_name: string;
  public gender: Gender;
  public given_name: string;
  public iat: number;
  public locale: string;
  public name: string;
  public nickname: string;
  public nonce: string;
  public picture: string;
  public sub: string;
  public updated_at: Moment;

  constructor(obj?: any) {
    if (obj) {
      this.at_hash = obj.at_hash;
      this.aud = obj.aud;
      this.exp = obj.exp;
      this.family_name = obj.family_name;
      this.gender = obj.gender;
      this.given_name = obj.given_name;
      this.iat = obj.iat;
      this.locale = obj.locale;
      this.name = obj.name;
      this.nickname = obj.nickname;
      this.nonce = obj.nonce;
      this.picture = obj.picture;
      this.sub = obj.sub;
      this.updated_at = obj.updated_at ? new moment(obj.updated_at) : undefined;
    }
  }
}
