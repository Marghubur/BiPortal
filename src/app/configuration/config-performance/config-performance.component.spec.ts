import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ConfigPerformanceComponent } from './config-performance.component';

describe('ConfigPerformanceComponent', () => {
  let component: ConfigPerformanceComponent;
  let fixture: ComponentFixture<ConfigPerformanceComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ ConfigPerformanceComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(ConfigPerformanceComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
