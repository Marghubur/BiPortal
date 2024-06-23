import { ComponentFixture, TestBed } from '@angular/core/testing';

import { BtChipComponent } from './bt-chip.component';

describe('BtChipComponent', () => {
  let component: BtChipComponent;
  let fixture: ComponentFixture<BtChipComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ BtChipComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(BtChipComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
