import { FlightListService } from '../../web-services/flight-list/flight-list.service';
import { FlightList } from '../../classes/flight-list/flight-list';
import { Component, OnInit, Output, EventEmitter } from '@angular/core';

@Component({
  selector: 'app-new-flight-list',
  templateUrl: './new-flight-list.component.html',
  styleUrls: ['./new-flight-list.component.scss']
})
export class NewFlightListComponent implements OnInit {
  public flightList: FlightList;
  public loading: Boolean;
  @Output() public newFlight = new EventEmitter<FlightList>();

  public newFlightList() {
    this.loading = true;
    this.flightListService.create(this.flightList).subscribe((flightList: FlightList) => {
      this.newFlight.emit(flightList);
      this.loading = false;
    }, err => {
      // already used slug/name
      this.flightList.name += Math.round((Math.random() * 9)).toString();
      this.loading = false;
    });
  }

  constructor(
    private flightListService: FlightListService
  ) { }

  ngOnInit() {
    this.flightList = new FlightList();
  }

}
