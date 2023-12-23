import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TaxcalculationComponent } from './taxcalculation.component';

describe('TaxcalculationComponent', () => {
  let component: TaxcalculationComponent;
  let fixture: ComponentFixture<TaxcalculationComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ TaxcalculationComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(TaxcalculationComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
