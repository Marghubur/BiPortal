import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TaxsavinginvestmentComponent } from './taxsavinginvestment.component';

describe('TaxsavinginvestmentComponent', () => {
  let component: TaxsavinginvestmentComponent;
  let fixture: ComponentFixture<TaxsavinginvestmentComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ TaxsavinginvestmentComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(TaxsavinginvestmentComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
