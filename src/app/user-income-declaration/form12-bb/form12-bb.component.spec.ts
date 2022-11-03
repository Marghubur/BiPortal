import { ComponentFixture, TestBed } from '@angular/core/testing';

import { Form12BBComponent } from './form12-bb.component';

describe('Form12BBComponent', () => {
  let component: Form12BBComponent;
  let fixture: ComponentFixture<Form12BBComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ Form12BBComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(Form12BBComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
