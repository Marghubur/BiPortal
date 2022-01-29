import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';

import { CodegeneratorComponent } from './codegenerator.component';

describe('CodegeneratorComponent', () => {
  let component: CodegeneratorComponent;
  let fixture: ComponentFixture<CodegeneratorComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [ CodegeneratorComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(CodegeneratorComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
