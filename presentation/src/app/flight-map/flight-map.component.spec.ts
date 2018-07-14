import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { FlightMapComponent } from './flight-map.component';

describe('FlightMapComponent', () => {
  let component: FlightMapComponent;
  let fixture: ComponentFixture<FlightMapComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ FlightMapComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(FlightMapComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
