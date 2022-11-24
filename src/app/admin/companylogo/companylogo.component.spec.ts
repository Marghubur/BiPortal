import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CompanylogoComponent } from './companylogo.component';

describe('CompanylogoComponent', () => {
  let component: CompanylogoComponent;
  let fixture: ComponentFixture<CompanylogoComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ CompanylogoComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(CompanylogoComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
