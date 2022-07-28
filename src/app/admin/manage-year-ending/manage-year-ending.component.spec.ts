import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ManageYearEndingComponent } from './manage-year-ending.component';

describe('ManageYearEndingComponent', () => {
  let component: ManageYearEndingComponent;
  let fixture: ComponentFixture<ManageYearEndingComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ ManageYearEndingComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(ManageYearEndingComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
