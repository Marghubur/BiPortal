import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';

import { UploadscriptComponent } from './uploadscript.component';

describe('UploadscriptComponent', () => {
  let component: UploadscriptComponent;
  let fixture: ComponentFixture<UploadscriptComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [ UploadscriptComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(UploadscriptComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
