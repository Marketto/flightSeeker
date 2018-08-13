import { Component } from '@angular/core';
import * as moment from 'moment-timezone';
import { TranslateService } from '@ngx-translate/core';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent {
  title = 'Flight Seeker';

  constructor(
    private translate: TranslateService
  ) {
    //const locale: string = this.translate.getBrowserLang();
    moment.locale('en');
  }
}
