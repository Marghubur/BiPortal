import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ManageLeaveplanComponent } from './manage-leaveplan.component';

describe('ManageLeaveplanComponent', () => {
  let component: ManageLeaveplanComponent;
  let fixture: ComponentFixture<ManageLeaveplanComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ ManageLeaveplanComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(ManageLeaveplanComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
