import { ComponentFixture, TestBed } from '@angular/core/testing';

import { RegisterNewOrgComponent } from './register-new-org.component';

describe('RegisterNewOrgComponent', () => {
  let component: RegisterNewOrgComponent;
  let fixture: ComponentFixture<RegisterNewOrgComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ RegisterNewOrgComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(RegisterNewOrgComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
