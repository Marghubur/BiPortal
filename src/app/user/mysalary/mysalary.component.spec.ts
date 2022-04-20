import { ComponentFixture, TestBed } from '@angular/core/testing';

import { MysalaryComponent } from './mysalary.component';

describe('MysalaryComponent', () => {
  let component: MysalaryComponent;
  let fixture: ComponentFixture<MysalaryComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ MysalaryComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(MysalaryComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
