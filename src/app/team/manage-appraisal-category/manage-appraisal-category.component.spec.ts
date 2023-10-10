import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ManageAppraisalCategoryComponent } from './manage-appraisal-category.component';

describe('ManageAppraisalCategoryComponent', () => {
  let component: ManageAppraisalCategoryComponent;
  let fixture: ComponentFixture<ManageAppraisalCategoryComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ ManageAppraisalCategoryComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ManageAppraisalCategoryComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
