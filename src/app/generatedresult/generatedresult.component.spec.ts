import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';

import { GeneratedresultComponent } from './generatedresult.component';

describe('GeneratedresultComponent', () => {
  let component: GeneratedresultComponent;
  let fixture: ComponentFixture<GeneratedresultComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [ GeneratedresultComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(GeneratedresultComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
