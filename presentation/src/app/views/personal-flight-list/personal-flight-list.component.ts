import { FlightListService } from './../../web-services/flight-list/flight-list.service';
import { ActivatedRoute } from '@angular/router';
import { FlightList } from './../../classes/flight-list/flight-list';
import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-personal-flight-list',
  templateUrl: './personal-flight-list.component.html',
  styleUrls: ['./personal-flight-list.component.scss']
})
export class PersonalFlightListComponent implements OnInit {

  public flightList: FlightList;

  constructor(
    private activeRoute: ActivatedRoute,
    private flightListService: FlightListService
  ) { }

  ngOnInit() {
    const flightListSlug = this.activeRoute.snapshot.params.flightListSlug;
    if (flightListSlug) {
      this.flightListService.get(flightListSlug).read().subscribe((flightList: FlightList) => {
        this.flightList = flightList;
      });
    }
  }

}
