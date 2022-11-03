import { ComponentFixture, TestBed } from '@angular/core/testing';

import { IncometaxComponent } from './incometax.component';

describe('IncometaxComponent', () => {
  let component: IncometaxComponent;
  let fixture: ComponentFixture<IncometaxComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ IncometaxComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(IncometaxComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
