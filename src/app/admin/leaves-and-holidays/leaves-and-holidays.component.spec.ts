import { ComponentFixture, TestBed } from '@angular/core/testing';

import { LeavesAndHolidaysComponent } from './leaves-and-holidays.component';

describe('LeavesAndHolidaysComponent', () => {
  let component: LeavesAndHolidaysComponent;
  let fixture: ComponentFixture<LeavesAndHolidaysComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ LeavesAndHolidaysComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(LeavesAndHolidaysComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
