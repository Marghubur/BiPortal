import { ComponentFixture, TestBed } from '@angular/core/testing';

import { FreetaxfillingComponent } from './freetaxfilling.component';

describe('FreetaxfillingComponent', () => {
  let component: FreetaxfillingComponent;
  let fixture: ComponentFixture<FreetaxfillingComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ FreetaxfillingComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(FreetaxfillingComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
