import { ComponentFixture, TestBed } from '@angular/core/testing';

import { EmployeeDeclarationlistComponent } from './employee-declarationlist.component';

describe('EmployeeDeclarationlistComponent', () => {
  let component: EmployeeDeclarationlistComponent;
  let fixture: ComponentFixture<EmployeeDeclarationlistComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ EmployeeDeclarationlistComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(EmployeeDeclarationlistComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
