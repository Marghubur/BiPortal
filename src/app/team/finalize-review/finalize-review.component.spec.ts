import { ComponentFixture, TestBed } from '@angular/core/testing';

import { FinalizeReviewComponent } from './finalize-review.component';

describe('FinalizeReviewComponent', () => {
  let component: FinalizeReviewComponent;
  let fixture: ComponentFixture<FinalizeReviewComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ FinalizeReviewComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(FinalizeReviewComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
