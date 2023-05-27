import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ApprisalReviewComponent } from './apprisal-review.component';

describe('ApprisalReviewComponent', () => {
  let component: ApprisalReviewComponent;
  let fixture: ComponentFixture<ApprisalReviewComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ ApprisalReviewComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ApprisalReviewComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
