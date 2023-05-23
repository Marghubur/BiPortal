import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AppraisalSettingComponent } from './appraisal-setting.component';

describe('AppraisalSettingComponent', () => {
  let component: AppraisalSettingComponent;
  let fixture: ComponentFixture<AppraisalSettingComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ AppraisalSettingComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(AppraisalSettingComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
