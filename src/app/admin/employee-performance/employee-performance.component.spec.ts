import { ComponentFixture, TestBed } from '@angular/core/testing';

import { EmployeePerformanceComponent } from './employee-performance.component';

describe('EmployeePerformanceComponent', () => {
  let component: EmployeePerformanceComponent;
  let fixture: ComponentFixture<EmployeePerformanceComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ EmployeePerformanceComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(EmployeePerformanceComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
