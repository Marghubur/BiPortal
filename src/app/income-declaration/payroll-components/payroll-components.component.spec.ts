import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PayrollComponentsComponent } from './payroll-components.component';

describe('PayrollComponentsComponent', () => {
  let component: PayrollComponentsComponent;
  let fixture: ComponentFixture<PayrollComponentsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ PayrollComponentsComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(PayrollComponentsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
