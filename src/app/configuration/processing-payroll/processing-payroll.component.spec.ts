import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ProcessingPayrollComponent } from './processing-payroll.component';

describe('ProcessingPayrollComponent', () => {
  let component: ProcessingPayrollComponent;
  let fixture: ComponentFixture<ProcessingPayrollComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ ProcessingPayrollComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ProcessingPayrollComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
