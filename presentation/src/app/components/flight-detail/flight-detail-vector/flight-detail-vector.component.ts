import * as moment from 'moment-timezone';
import { Component, OnInit, Input } from '@angular/core';
import { FlightVector } from '../../../classes/flight/flight-vector';

@Component({
  selector: 'app-flight-detail-vector',
  templateUrl: './flight-detail-vector.component.html',
  styleUrls: ['./flight-detail-vector.component.scss']
})
export class FlightDetailVectorComponent implements OnInit {

  @Input() public flightVector: FlightVector;

  constructor() {
  }

  ngOnInit() {
    moment.relativeTimeThreshold('m', 60);
    moment.relativeTimeThreshold('h', 24);
  }

}
