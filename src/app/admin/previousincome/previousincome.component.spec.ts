import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PreviousincomeComponent } from './previousincome.component';

describe('PreviousincomeComponent', () => {
  let component: PreviousincomeComponent;
  let fixture: ComponentFixture<PreviousincomeComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ PreviousincomeComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(PreviousincomeComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
