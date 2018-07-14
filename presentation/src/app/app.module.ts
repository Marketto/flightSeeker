import { BrowserModule } from '@angular/platform-browser';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { NgModule } from '@angular/core';

import { FormsModule } from '@angular/forms';
import { HttpClientModule } from '@angular/common/http';
import { MomentModule } from 'angular2-moment';
import { TranslateModule } from '@ngx-translate/core';
import { AngularOpenlayersModule } from 'ngx-openlayers';

import { CardModule } from 'primeng/card';
import { AutoCompleteModule } from 'primeng/autocomplete';
import { CalendarModule } from 'primeng/calendar';
import { ProgressBarModule } from 'primeng/progressbar';
import { ButtonModule } from 'primeng/button';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';

import { FlightSearchComponent } from './flight-search/flight-search.component';
import { FlightDetailComponent } from './flight-detail/flight-detail.component';
import { SearchResultsComponent } from './search-results/search-results.component';
import { JourneyDetailComponent } from './journey-detail/journey-detail.component';
import { FlightMapComponent } from './flight-map/flight-map.component';

@NgModule({
  declarations: [
    AppComponent,
    FlightSearchComponent,
    FlightDetailComponent,
    SearchResultsComponent,
    JourneyDetailComponent,
    FlightMapComponent
  ],
  imports: [
    BrowserModule,
    BrowserAnimationsModule,
    AppRoutingModule,
    CardModule,
    AutoCompleteModule,
    CalendarModule,
    ProgressBarModule,
    ButtonModule,
    FormsModule,
    HttpClientModule,
    MomentModule,
    TranslateModule.forRoot(),
    AngularOpenlayersModule
  ],
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule { }
