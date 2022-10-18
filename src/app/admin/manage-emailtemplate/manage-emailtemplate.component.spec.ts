import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ManageEmailtemplateComponent } from './manage-emailtemplate.component';

describe('ManageEmailtemplateComponent', () => {
  let component: ManageEmailtemplateComponent;
  let fixture: ComponentFixture<ManageEmailtemplateComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ ManageEmailtemplateComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(ManageEmailtemplateComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
