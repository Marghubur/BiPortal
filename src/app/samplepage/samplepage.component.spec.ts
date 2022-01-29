import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';

import { SamplepageComponent } from './samplepage.component';

describe('SamplepageComponent', () => {
  let component: SamplepageComponent;
  let fixture: ComponentFixture<SamplepageComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [ SamplepageComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(SamplepageComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
