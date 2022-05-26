import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PfEsiSetupComponent } from './pf-esi-setup.component';

describe('PfEsiSetupComponent', () => {
  let component: PfEsiSetupComponent;
  let fixture: ComponentFixture<PfEsiSetupComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ PfEsiSetupComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(PfEsiSetupComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
