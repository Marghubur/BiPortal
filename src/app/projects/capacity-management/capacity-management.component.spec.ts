import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CapacityManagementComponent } from './capacity-management.component';

describe('CapacityManagementComponent', () => {
  let component: CapacityManagementComponent;
  let fixture: ComponentFixture<CapacityManagementComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ CapacityManagementComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(CapacityManagementComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
