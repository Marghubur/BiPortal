import { ComponentFixture, TestBed } from '@angular/core/testing';

import { LeaveAttendanceDailywagesComponent } from './leave-attendance-dailywages.component';

describe('LeaveAttendanceDailywagesComponent', () => {
  let component: LeaveAttendanceDailywagesComponent;
  let fixture: ComponentFixture<LeaveAttendanceDailywagesComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ LeaveAttendanceDailywagesComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(LeaveAttendanceDailywagesComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
