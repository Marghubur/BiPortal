import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ApprovalRuleComponent } from './approval-rule.component';

describe('ApprovalRuleComponent', () => {
  let component: ApprovalRuleComponent;
  let fixture: ComponentFixture<ApprovalRuleComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ ApprovalRuleComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(ApprovalRuleComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});