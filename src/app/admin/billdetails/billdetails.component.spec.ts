import { ComponentFixture, TestBed } from '@angular/core/testing';

import { BilldetailsComponent } from './billdetails.component';

describe('BilldetailsComponent', () => {
  let component: BilldetailsComponent;
  let fixture: ComponentFixture<BilldetailsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ BilldetailsComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(BilldetailsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
