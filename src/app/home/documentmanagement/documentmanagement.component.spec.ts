import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DocumentmanagementComponent } from './documentmanagement.component';

describe('DocumentmanagementComponent', () => {
  let component: DocumentmanagementComponent;
  let fixture: ComponentFixture<DocumentmanagementComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ DocumentmanagementComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(DocumentmanagementComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
