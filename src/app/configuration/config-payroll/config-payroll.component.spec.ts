import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ConfigPayrollComponent } from './config-payroll.component';

describe('ConfigPayrollComponent', () => {
  let component: ConfigPayrollComponent;
  let fixture: ComponentFixture<ConfigPayrollComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ ConfigPayrollComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ConfigPayrollComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
