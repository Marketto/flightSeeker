import { Flight } from './../class/flight/flight';
import { AirlineService } from './../web-services/airline/airline.service';
import { AirlineQuery } from './../class/airline/airline-query';
import { Airport } from './../class/airport/airport';
import { AirportService } from './../web-services/airport/airport.service';
import { Component, OnInit } from '@angular/core';
import { AirportQuery } from '../class/airport/airport-query';
import { Airline } from '../class/airline/airline';
import { FlightService } from '../web-services/flight/flight.service';
import { FlightQuery } from '../class/flight/flight-query';
import * as moment from 'moment-timezone';

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

  departureAirports: Airport[];
  arrivalAirports: Airport[];
  airlines: Airline[];
  flights: Flight[];
  returnFlights: Flight[];


  public get departureAirport() {
    return this.$departureAirport;
  }
  public set departureAirport(airport: Airport) {
    this.$departureAirport = airport;
    this.searchFlight();
  }

  public get arrivalAirport() {
    return this.$arrivalAirport;
  }
  public set arrivalAirport(airport: Airport) {
    this.$arrivalAirport = airport;
    this.searchFlight();
  }

  public get airline() {
    return this.$airline;
  }
  public set airline(airline: Airline) {
    this.$airline = airline;
    this.searchFlight();
  }

  public get departureDate() {
    return this.$departureDate;
  }
  public set departureDate(date: Date) {
    this.$departureDate = date;
    this.searchFlight();
  }

  public get departureTime() {
    return this.$departureTime;
  }
  public set departureTime(date: Date) {
    this.$departureTime = date;
    this.searchFlight();
  }

  searchAirport(airportCriteria) {
    this.airportService.search(new AirportQuery({
      'startsWith': airportCriteria
    })).subscribe((data: Airport[]) => {
      this.departureAirports = data.filter(airport => airport.iata !== (this.arrivalAirport || new Airport()).iata);
      this.arrivalAirports = data.filter(airport => airport.iata !== (this.departureAirport || new Airport()).iata);
    });
  }

  searchAirline(airlineCriteria) {
    this.airlineService.search(new AirlineQuery({
      'startsWith': airlineCriteria,
      'fromAirportIata': (this.departureAirport || new Airport()).iata,
      'toAirportIata': (this.arrivalAirport || new Airport()).iata
    })).subscribe((data: Airline[]) => {
      this.airlines = data;
    });
  }

  searchFlight() {
    this.flights = null;
    this.returnFlights = null;
    if (this.departureAirport && this.arrivalAirport && this.departureDate) {
      this.flightService.search(this.departureAirport.iata, this.arrivalAirport.iata, this.departureDate, new FlightQuery({
        'airlineIata': this.airline ? this.airline.iata : undefined,
        'at': this.departureTime ? moment(this.departureTime) : undefined
      })).subscribe((data: Flight[]) => {
        this.flights = data;
        if (this.flights.length === 1) {
          this.searchReturnFlight(this.flights[0]);
        }
      });
    }
  }

  searchReturnFlight(flight: Flight) {
    const returnDepartureDateTime = moment(flight.arrivalDateTime);
    returnDepartureDateTime.add(40, 'm');
    this.flightService.search(flight.arrivalCode, flight.departureCode, returnDepartureDateTime.toDate(), new FlightQuery({
      'after' : returnDepartureDateTime,
      'limit' : 1,
      'airlineIata': flight.flightLegDetails[flight.flightLegDetails.length - 1].marketingAirline.iata
    })).subscribe((data: Flight[]) => {
      this.returnFlights = data;
    });
  }

  constructor(
    private airportService: AirportService,
    private airlineService: AirlineService,
    private flightService: FlightService
  ) {}

  ngOnInit() {
  }

}
