import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { PersonalFlightListComponent } from './personal-flight-list.component';

describe('PersonalFlightListComponent', () => {
  let component: PersonalFlightListComponent;
  let fixture: ComponentFixture<PersonalFlightListComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ PersonalFlightListComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(PersonalFlightListComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
