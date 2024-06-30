import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ProjectperformanceComponent } from './projectperformance.component';

describe('ProjectperformanceComponent', () => {
  let component: ProjectperformanceComponent;
  let fixture: ComponentFixture<ProjectperformanceComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ ProjectperformanceComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ProjectperformanceComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
