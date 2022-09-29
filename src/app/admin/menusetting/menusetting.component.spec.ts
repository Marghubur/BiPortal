import { ComponentFixture, TestBed } from '@angular/core/testing';

import { MenusettingComponent } from './menusetting.component';

describe('MenusettingComponent', () => {
  let component: MenusettingComponent;
  let fixture: ComponentFixture<MenusettingComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ MenusettingComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(MenusettingComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
