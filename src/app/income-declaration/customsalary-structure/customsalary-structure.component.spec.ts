import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CustomsalaryStructureComponent } from './customsalary-structure.component';

describe('CustomsalaryStructureComponent', () => {
  let component: CustomsalaryStructureComponent;
  let fixture: ComponentFixture<CustomsalaryStructureComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ CustomsalaryStructureComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(CustomsalaryStructureComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
