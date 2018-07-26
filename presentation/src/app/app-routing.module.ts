import { AuthorizingComponent } from './views/authorizing/authorizing.component';
import { JourneyDetailComponent } from './views/journey-detail/journey-detail.component';
import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { FlightSearchComponent } from './views/flight-search/flight-search.component';
import { SearchResultsComponent } from './views/search-results/search-results.component';
import { HomeComponent } from './views/home/home.component';
import { PersonalFlightListComponent } from './views/personal-flight-list/personal-flight-list.component';

const routes: Routes = [
  {
    path: 'auth',
    component: AuthorizingComponent
  },
  {
    path: '',
    component: HomeComponent,
    children: [
      {
        path : '',
        component : FlightSearchComponent,
        children : [
          {
            path: '',
            component: SearchResultsComponent
          },
          {
            path: ':flightId',
            component: JourneyDetailComponent
          }
        ]
      },
      {
        path : 'list/:flightListSlug',
        component : PersonalFlightListComponent
      }
    ]
  }
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
