import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SalaryBreakupComponent } from './salary-breakup.component';

describe('SalaryBreakupComponent', () => {
  let component: SalaryBreakupComponent;
  let fixture: ComponentFixture<SalaryBreakupComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ SalaryBreakupComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(SalaryBreakupComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
