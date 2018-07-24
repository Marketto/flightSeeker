import { ActivatedRoute } from '@angular/router';
import { Flight } from '../../classes/flight/flight';
import { Component, OnInit } from '@angular/core';
import * as moment from 'moment-timezone';
import { FlightService } from '../../web-services/flight/flight.service';
import { FlightQuery } from '../../classes/flight/flight-query';

@Component({
  selector: 'app-journey-detail',
  templateUrl: './journey-detail.component.html',
  styleUrls: ['./journey-detail.component.scss']
})
export class JourneyDetailComponent implements OnInit {
  private $goingFlight: Flight;
  public backFlight: Flight;
  public currentFlight: Flight;

  public setBackProgress(backProgress: number) {
    if (backProgress || backProgress === 0) {
      this.currentFlight = this.backFlight;
    }
  }

  public get goingFlight(): Flight {
    return this.$goingFlight;
  }
  public set goingFlight(flight: Flight) {
    this.$goingFlight = flight;
    if (flight.arrival.dateTime > new moment()) {
      this.currentFlight = flight;
    }
    this.searchReturnFlight(flight);
  }

  private getGoingFlight(uuid: string) {
    this.flightService.read(uuid).subscribe((flight: Flight) => {
      this.goingFlight = flight;
    });
  }


  private searchReturnFlight(flight: Flight) {
    const returnDepartureDateTime = moment(flight.arrival.dateTime).add(40, 'm');
    this.flightService.search(flight.arrival.airport.iata, flight.departure.airport.iata, returnDepartureDateTime, new FlightQuery({
      'after': returnDepartureDateTime,
      'limit': 1,
      'airlineIata': flight.airline.iata
    })).subscribe((flights: Flight[]) => {
      this.backFlight = flights[0];

      this.currentFlight = this.currentFlight || this.backFlight;
    });
  }

  constructor(
    private flightService: FlightService,
    private activeRoute: ActivatedRoute
  ) { }

  ngOnInit() {
    const FLIGHT_UUID_VALIDATOR = /^[A-Z\d\*]{6}\d{8}[A-Z\d\*]{2}\d+$/;

    const params = this.activeRoute.snapshot.params;

    if (FLIGHT_UUID_VALIDATOR.test(params.flightId)) {
      this.getGoingFlight(params.flightId);
    }
  }

}
