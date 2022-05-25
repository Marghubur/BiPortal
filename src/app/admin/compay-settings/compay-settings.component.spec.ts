import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CompaySettingsComponent } from './compay-settings.component';

describe('CompaySettingsComponent', () => {
  let component: CompaySettingsComponent;
  let fixture: ComponentFixture<CompaySettingsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ CompaySettingsComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(CompaySettingsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
