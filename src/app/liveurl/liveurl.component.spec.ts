import { ComponentFixture, TestBed } from '@angular/core/testing';

import { LiveurlComponent } from './liveurl.component';

describe('LiveurlComponent', () => {
  let component: LiveurlComponent;
  let fixture: ComponentFixture<LiveurlComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ LiveurlComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(LiveurlComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
