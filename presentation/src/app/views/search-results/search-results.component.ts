import { FlightService } from '../../web-services/flight/flight.service';
import { ActivatedRoute } from '@angular/router';
import { Component, OnInit } from '@angular/core';
import * as moment from 'moment-timezone';
import { Moment } from 'moment-timezone';
import { Flight } from '../../classes/flight/flight';
import { FlightQuery } from '../../classes/flight/flight-query';

@Component({
  selector: 'app-search-results',
  templateUrl: './search-results.component.html',
  styleUrls: ['./search-results.component.scss']
})
export class SearchResultsComponent implements OnInit {

  private departureAirportIata: string;
  private arrivalAirportIata: string;
  private airlineIata: string;
  private departureDate: Moment;
  private departureTime: Moment;

  public flights: Flight[];


  private searchFlights() {
    this.flights = null;

    if (this.departureAirportIata && this.arrivalAirportIata && this.departureDate) {
      this.flightService.search(
        this.departureAirportIata,
        this.arrivalAirportIata,
        this.departureDate,
        new FlightQuery({
          'airlineIata': this.airlineIata,
          'at': this.departureTime
        })
      ).subscribe((data: Flight[]) => {
        this.flights = data;
      });
    }
  }


  constructor(
    private flightService: FlightService,
    private activeRoute: ActivatedRoute
  ) { }

  ngOnInit() {
    const AIRPORT_VALIDATOR = /^[A-Z\d\*]{3}$/i;
    const AIRLINE_VALIDATOR = /^[A-Z\d\*]{2}$/i;
    const DATE_VALIDATOR = /^\d{4}(?:\-\d{2}){2}$/;
    const TIME_VALIDATOR = /^\d{2}:\d{2}$/;

    this.activeRoute.queryParams.subscribe(params => {
      if (AIRPORT_VALIDATOR.test(params.from)) {
        this.departureAirportIata = params.from.toUpperCase();
      }
      if (AIRPORT_VALIDATOR.test(params.to)) {
        this.arrivalAirportIata = params.to.toUpperCase();
      }
      if (AIRLINE_VALIDATOR.test(params.by)) {
        this.airlineIata = params.by.toUpperCase();
      }
      if (DATE_VALIDATOR.test(params.date) && moment(params.date, 'YYYY-MM-DD').isValid()) {
        this.departureDate = moment(params.date, 'YYYY-MM-DD');
      }
      if (TIME_VALIDATOR.test(params.time) && moment(params.time, 'HH:mm').isValid()) {
        this.departureTime = moment(params.time, 'HH:mm');
      }

      this.searchFlights();
    });
  }

}
