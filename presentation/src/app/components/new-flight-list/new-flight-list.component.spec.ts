import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { NewFlightListComponent } from './new-flight-list.component';

describe('NewFlightListComponent', () => {
  let component: NewFlightListComponent;
  let fixture: ComponentFixture<NewFlightListComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ NewFlightListComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(NewFlightListComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
