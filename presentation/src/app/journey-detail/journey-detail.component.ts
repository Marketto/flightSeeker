import { Position } from './../class/airport/position/position';
import { ActivatedRoute } from '@angular/router';
import { Flight } from './../class/flight/flight';
import { Component, OnInit, OnDestroy } from '@angular/core';
import * as moment from 'moment-timezone';
import { FlightService } from '../web-services/flight/flight.service';
import { FlightQuery } from '../class/flight/flight-query';
import { Subscription } from 'rxjs';
import { NowService } from '../services/now.service';

@Component({
  selector: 'app-journey-detail',
  templateUrl: './journey-detail.component.html',
  styleUrls: ['./journey-detail.component.scss']
})
export class JourneyDetailComponent implements OnInit {
  private $goingFlight: Flight;
  public backFlight: Flight;
  public estimatedPosition: Position = new Position();
  public setGoingProgress(goingProgress: number) {
    this.estimatePosition(this.goingFlight, goingProgress, true);
  }
  public setBackProgress(backProgress: number) {
    this.estimatePosition(this.backFlight, backProgress);
  }

  public get goingFlight(): Flight {
    return this.$goingFlight;
  }
  public set goingFlight(flight: Flight) {
    this.$goingFlight = flight;
    this.searchReturnFlight(flight);
  }

  private getGoingFlight(uuid: string) {
    this.flightService.read(uuid).subscribe((flight: Flight) => {
      this.goingFlight = flight;
    });
  }

  private estimatePosition(flight: Flight, progress: number, ignoreComplete: boolean = false) {
    const departureLongitude = flight.departureAirport.position.longitude;
    const arrivalLongitude = flight.arrivalAirport.position.longitude;
    const departureLatitude = flight.departureAirport.position.latitude;
    const arrivalLatitude = flight.arrivalAirport.position.latitude;

    if (!progress) {
      this.estimatedPosition.latitude = departureLatitude;
      this.estimatedPosition.longitude = departureLongitude;
    } else if (progress < 100) {
      this.estimatedPosition.latitude = departureLatitude + (arrivalLatitude - departureLatitude) * progress / 100;
      this.estimatedPosition.longitude = departureLongitude + (arrivalLongitude - departureLongitude) * progress / 100;
    } else if (!ignoreComplete){
      this.estimatedPosition.latitude = departureLatitude;
      this.estimatedPosition.longitude = departureLongitude;
    }
  }

  private searchReturnFlight(flight: Flight) {
    const returnDepartureDateTime = moment(flight.arrivalDateTime);
    returnDepartureDateTime.add(40, 'm');
    this.flightService.search(flight.arrivalCode, flight.departureCode, returnDepartureDateTime.toDate(), new FlightQuery({
      'after': returnDepartureDateTime,
      'limit': 1,
      'airlineIata': flight.airlineIata
    })).subscribe((flights: Flight[]) => {
      this.backFlight = flights[0];
    });
  }

  constructor(
    private flightService: FlightService,
    private activeRoute: ActivatedRoute
  ) { }

  ngOnInit() {
    const FLIGHT_UUID_VALIDATOR = /^[A-Z\d\*]{6}\d{8}[A-Z\d\*]{2}\d{4}$/;

    const params = this.activeRoute.snapshot.params;

    if (FLIGHT_UUID_VALIDATOR.test(params.flightId)) {
      this.getGoingFlight(params.flightId);
    }
  }

}
