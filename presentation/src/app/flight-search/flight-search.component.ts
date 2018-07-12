import { Flight } from './../class/flight/flight';
import { AirlineService } from './../web-services/airline/airline.service';
import { AirlineQuery } from './../class/airline/airline-query';
import { Airport } from './../class/airport/airport';
import { AirportService } from './../web-services/airport/airport.service';
import { Component, OnInit } from '@angular/core';
import { AirportQuery } from '../class/airport/airport-query';
import { Airline } from '../class/airline/airline';
import * as moment from 'moment-timezone';
import { isString } from 'util';
import { ActivatedRoute, Router } from '@angular/router';

@Component({
  selector: 'app-flight-search',
  templateUrl: './flight-search.component.html',
  styleUrls: ['./flight-search.component.scss']
})
export class FlightSearchComponent implements OnInit {

  private $departureAirport: Airport;
  private $arrivalAirport: Airport;
  private $airline: Airline;
  private $departureDate: Date;
  private $departureTime: Date;

  public departureAirports: Airport[];
  public arrivalAirports: Airport[];
  public airlines: Airline[];


  public get departureAirport() {
    return this.$departureAirport;
  }
  public set departureAirport(airport: Airport) {
    this.$departureAirport = airport;
    // this.searchGoingFlight();
  }

  public get arrivalAirport() {
    return this.$arrivalAirport;
  }
  public set arrivalAirport(airport: Airport) {
    this.$arrivalAirport = airport;
    // this.searchGoingFlight();
    this.updateQueryParams();
  }

  public get airline() {
    return this.$airline;
  }
  public set airline(airline: Airline) {
    this.$airline = airline;
    // this.searchGoingFlight();
    this.updateQueryParams();
  }

  public get departureDate() {
    return this.$departureDate;
  }
  public set departureDate(date: Date) {
    this.$departureDate = date;
    // this.searchGoingFlight();
    this.updateQueryParams();
  }

  public get departureTime() {
    return this.$departureTime;
  }
  public set departureTime(date: Date) {
    this.$departureTime = date;
    // this.searchGoingFlight();
    this.updateQueryParams();
  }

  public searchDepartureAirport(airportCriteria: string) {
    this.airportService.search(new AirportQuery({
      'startsWith': airportCriteria
    })).subscribe((data: Airport[] = []) => {
      const departureAirports = data.filter(airport => airport.iata !== (this.arrivalAirport || new Airport()).iata);

      const matchingDepartureAirport = departureAirports.find(airport => {
        return airport.name.toLowerCase() === airportCriteria.toLowerCase() || airport.iata === airportCriteria;
      });
      if (matchingDepartureAirport) {
        this.departureAirport = matchingDepartureAirport;
      }
      this.departureAirports = departureAirports;
    });
  }

  private setDepartureAirport(airportIata: string) {
    this.airportService.read(airportIata).subscribe((airport: Airport) => {
      this.$departureAirport = airport;
    });
  }

  public searchArrivalAirport(airportCriteria: string) {
    this.airportService.search(new AirportQuery({
      'startsWith': airportCriteria
    })).subscribe((data: Airport[] = []) => {
      const arrivalAirports = data.filter(airport => airport.iata !== (this.departureAirport || new Airport()).iata);

      const matchingArrivalAirport = arrivalAirports.find(airport => {
        return airport.name.toLowerCase() === airportCriteria.toLowerCase() || airport.iata === airportCriteria;
      });
      if (matchingArrivalAirport) {
        this.arrivalAirport = matchingArrivalAirport;
      }
      this.arrivalAirports = arrivalAirports;
    });
  }

  private setArrivalAirport(airportIata: string) {
    this.airportService.read(airportIata).subscribe((airport: Airport) => {
      this.$arrivalAirport = airport;
    });
  }

  public searchAirline(airlineCriteria) {
    this.airlineService.search(new AirlineQuery({
      'startsWith': airlineCriteria,
      'fromAirportIata': (this.departureAirport || new Airport()).iata,
      'toAirportIata': (this.arrivalAirport || new Airport()).iata
    })).subscribe((data: Airline[] = []) => {
      const matchingAirline = data.find(airline => {
        return airline.name.toLowerCase() === airlineCriteria.toLowerCase() || airline.iata === airlineCriteria;
      });
      if (matchingAirline) {
        this.airline = matchingAirline;
      }
      this.airlines = data;
    });
  }

  private setAirline(airlineIata: string) {
    this.airlineService.read(airlineIata).subscribe((airline: Airline) => {
      this.$airline = airline;
    });
  }

  public autoSelectFromList(value: string|any, list: any[]) {
    if ((isString(value) || !value) && list) {
      return list[0];
    }
    return value;
  }

  private updateQueryParams() {
    this.router.navigate([], {
      queryParams: {
        from: this.departureAirport && this.departureAirport.iata,
        to: this.arrivalAirport && this.arrivalAirport.iata,
        by: this.airline && this.airline.iata,
        date: this.departureDate && moment(this.departureDate).format('YYYY-MM-DD'),
        time: this.departureTime && moment(this.departureTime).format('HH:mm')
      }
    });
  }

  constructor(
    private airportService: AirportService,
    private airlineService: AirlineService,
    private router: Router,
    private activeRoute: ActivatedRoute
  ) {}

  ngOnInit() {
    const AIRPORT_VALIDATOR = /^[A-Z\d\*]{3}$/i;
    const AIRLINE_VALIDATOR = /^[A-Z\d\*]{2}$/i;
    const DATE_VALIDATOR = /^\d{4}(?:\-\d{2}){2}$/;
    const TIME_VALIDATOR = /^\d{2}:\d{2}$/;
    const FLIGHT_UUID_VALIDATOR = /^([A-Z\d\*]{3})([A-Z\d\*]{3})(\d{8})([A-Z\d\*]{2})(\d{4})$/;

    const params = this.activeRoute.snapshot.queryParams;
    const childParams = this.activeRoute.snapshot.firstChild.params;

    if (FLIGHT_UUID_VALIDATOR.test(childParams.flightId)) {
      const parsedUuid = FLIGHT_UUID_VALIDATOR.exec(childParams.flightId);

      this.setDepartureAirport(parsedUuid[1].toUpperCase());
      this.setArrivalAirport(parsedUuid[2].toUpperCase());
      this.setAirline(parsedUuid[4].toUpperCase());
      this.$departureDate = new moment(parsedUuid[3], 'YYYYMMDD').toDate();

    } else {

      if (AIRPORT_VALIDATOR.test(params.from)) {
        this.setDepartureAirport(params.from.toUpperCase());
      }
      if (AIRPORT_VALIDATOR.test(params.to)) {
        this.setArrivalAirport(params.to.toUpperCase());
      }
      if (AIRLINE_VALIDATOR.test(params.by)) {
        this.setAirline(params.by.toUpperCase());
      }
      if (DATE_VALIDATOR.test(params.date) && moment(params.date, 'YYYY-MM-DD').isValid()) {
        this.$departureDate = new moment(params.date, 'YYYY-MM-DD').toDate();
      }
      if (TIME_VALIDATOR.test(params.time) && moment(params.time, 'HH:mm').isValid()) {
        this.$departureTime = new moment(params.time, 'HH:mm').toDate();
      }

    }
  }

}
