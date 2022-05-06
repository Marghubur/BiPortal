import { ComponentFixture, TestBed } from '@angular/core/testing';

import { Form12BbComponent } from './form12-bb.component';

describe('Form12BbComponent', () => {
  let component: Form12BbComponent;
  let fixture: ComponentFixture<Form12BbComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ Form12BbComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(Form12BbComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
