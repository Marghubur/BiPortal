import { ComponentFixture, TestBed } from '@angular/core/testing';

import { documentsComponent } from './documents.component';

describe('documentsComponent', () => {
  let component: documentsComponent;
  let fixture: ComponentFixture<documentsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ documentsComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(documentsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
