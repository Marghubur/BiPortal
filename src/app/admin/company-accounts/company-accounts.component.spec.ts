import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CompanyAccountsComponent } from './company-accounts.component';

describe('CompanyAccountsComponent', () => {
  let component: CompanyAccountsComponent;
  let fixture: ComponentFixture<CompanyAccountsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ CompanyAccountsComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(CompanyAccountsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
