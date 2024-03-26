import { ComponentFixture, TestBed } from '@angular/core/testing';

import { EmployeefinanceComponent } from './employeefinance.component';

describe('EmployeefinanceComponent', () => {
  let component: EmployeefinanceComponent;
  let fixture: ComponentFixture<EmployeefinanceComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ EmployeefinanceComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(EmployeefinanceComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
