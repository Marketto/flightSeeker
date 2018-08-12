import { BrowserModule } from '@angular/platform-browser';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { NgModule } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { HttpClientModule } from '@angular/common/http';
import { MomentModule } from 'ngx-moment';
import { TranslateModule } from '@ngx-translate/core';
import { AngularOpenlayersModule } from 'ngx-openlayers';

import { CardModule } from 'primeng/card';
import { AutoCompleteModule } from 'primeng/autocomplete';
import { CalendarModule } from 'primeng/calendar';
import { ProgressBarModule } from 'primeng/progressbar';
import { ButtonModule } from 'primeng/button';
import { MenubarModule } from 'primeng/menubar';
import { MenuModule } from 'primeng/menu';
import { PanelMenuModule } from 'primeng/panelmenu';
import { ProgressSpinnerModule } from 'primeng/progressspinner';
import { DialogModule } from 'primeng/dialog';
import { MessagesModule } from 'primeng/messages';
import { MessageModule } from 'primeng/message';

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
import { NewFlightListComponent } from './components/new-flight-list/new-flight-list.component';
import { PersonalFlightListComponent } from './views/personal-flight-list/personal-flight-list.component';
import { FlightDetailVectorComponent } from './components/flight-detail/flight-detail-vector/flight-detail-vector.component';

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
    HomeComponent,
    NewFlightListComponent,
    PersonalFlightListComponent,
    FlightDetailVectorComponent
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
    MenuModule,
    PanelMenuModule,
    ProgressSpinnerModule,
    DialogModule,
    MessagesModule,
    MessageModule,
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
