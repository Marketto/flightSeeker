import { JourneyDetailComponent } from './journey-detail/journey-detail.component';
import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { FlightSearchComponent } from './flight-search/flight-search.component';
import { SearchResultsComponent } from './search-results/search-results.component';

const routes: Routes = [
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
  }
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
