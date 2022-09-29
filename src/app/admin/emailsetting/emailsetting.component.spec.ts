import { ComponentFixture, TestBed } from '@angular/core/testing';

import { EmailsettingComponent } from './emailsetting.component';

describe('EmailsettingComponent', () => {
  let component: EmailsettingComponent;
  let fixture: ComponentFixture<EmailsettingComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ EmailsettingComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(EmailsettingComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
