import { ComponentFixture, TestBed } from '@angular/core/testing';

import { EmaillinkconfigComponent } from './emaillinkconfig.component';

describe('EmaillinkconfigComponent', () => {
  let component: EmaillinkconfigComponent;
  let fixture: ComponentFixture<EmaillinkconfigComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ EmaillinkconfigComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(EmaillinkconfigComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
