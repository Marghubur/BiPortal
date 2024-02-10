import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ManageCronjobComponent } from './manage-cronjob.component';

describe('ManageCronjobComponent', () => {
  let component: ManageCronjobComponent;
  let fixture: ComponentFixture<ManageCronjobComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ ManageCronjobComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ManageCronjobComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
