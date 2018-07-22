import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { AuthorizingComponent } from './authorizing.component';

describe('AuthorizingComponent', () => {
  let component: AuthorizingComponent;
  let fixture: ComponentFixture<AuthorizingComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ AuthorizingComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(AuthorizingComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
