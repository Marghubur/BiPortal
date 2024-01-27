import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CronjobSettingComponent } from './cronjob-setting.component';

describe('CronjobSettingComponent', () => {
  let component: CronjobSettingComponent;
  let fixture: ComponentFixture<CronjobSettingComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ CronjobSettingComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(CronjobSettingComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
