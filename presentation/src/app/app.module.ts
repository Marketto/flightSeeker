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
import { MenubarModule } from 'primeng/menubar';
import { ProgressSpinnerModule } from 'primeng/progressspinner';


import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';

import { FlightSearchComponent } from './views/flight-search/flight-search.component';
import { FlightDetailComponent } from './components/flight-detail/flight-detail.component';
import { SearchResultsComponent } from './views/search-results/search-results.component';
import { JourneyDetailComponent } from './views/journey-detail/journey-detail.component';
import { FlightMapComponent } from './components/flight-map/flight-map.component';
import { MenuBarComponent } from './components/menu-bar/menu-bar.component';
import { AuthorizingComponent } from './views/authorizing/authorizing.component';
import { HomeComponent } from './views/home/home.component';

@NgModule({
  declarations: [
    AppComponent,
    FlightSearchComponent,
    FlightDetailComponent,
    SearchResultsComponent,
    JourneyDetailComponent,
    FlightMapComponent,
    MenuBarComponent,
    AuthorizingComponent,
    HomeComponent
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
    MenubarModule,
    ProgressSpinnerModule,
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
