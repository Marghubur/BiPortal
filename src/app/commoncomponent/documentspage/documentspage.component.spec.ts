import { ComponentFixture, TestBed } from '@angular/core/testing';

import { documentspageComponent } from './documentspage.component';

describe('documentspageComponent', () => {
  let component: documentspageComponent;
  let fixture: ComponentFixture<documentspageComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ documentspageComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(documentspageComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
