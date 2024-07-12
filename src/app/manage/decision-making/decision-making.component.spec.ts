import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DecisionMakingComponent } from './decision-making.component';

describe('DecisionMakingComponent', () => {
  let component: DecisionMakingComponent;
  let fixture: ComponentFixture<DecisionMakingComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ DecisionMakingComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(DecisionMakingComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
