import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PerformancemanagementComponent } from './performancemanagement.component';

describe('PerformancemanagementComponent', () => {
  let component: PerformancemanagementComponent;
  let fixture: ComponentFixture<PerformancemanagementComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ PerformancemanagementComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(PerformancemanagementComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
