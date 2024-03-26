import { ComponentFixture, TestBed } from '@angular/core/testing';

import { HRManagementComponent } from './hrmanagement.component';

describe('HRManagementComponent', () => {
  let component: HRManagementComponent;
  let fixture: ComponentFixture<HRManagementComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ HRManagementComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(HRManagementComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
