import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { FlightDetailVectorComponent } from './flight-detail-vector.component';

describe('FlightDetailVectorComponent', () => {
  let component: FlightDetailVectorComponent;
  let fixture: ComponentFixture<FlightDetailVectorComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ FlightDetailVectorComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(FlightDetailVectorComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
