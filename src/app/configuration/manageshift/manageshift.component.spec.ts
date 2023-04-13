import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ManageshiftComponent } from './manageshift.component';

describe('ManageshiftComponent', () => {
  let component: ManageshiftComponent;
  let fixture: ComponentFixture<ManageshiftComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ ManageshiftComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(ManageshiftComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
