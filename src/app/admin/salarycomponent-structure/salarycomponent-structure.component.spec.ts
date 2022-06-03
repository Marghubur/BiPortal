import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SalarycomponentStructureComponent } from './salarycomponent-structure.component';

describe('SalarycomponentStructureComponent', () => {
  let component: SalarycomponentStructureComponent;
  let fixture: ComponentFixture<SalarycomponentStructureComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ SalarycomponentStructureComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(SalarycomponentStructureComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
