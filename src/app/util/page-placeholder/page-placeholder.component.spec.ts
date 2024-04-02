import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PagePlaceholderComponent } from './page-placeholder.component';

describe('PagePlaceholderComponent', () => {
  let component: PagePlaceholderComponent;
  let fixture: ComponentFixture<PagePlaceholderComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ PagePlaceholderComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(PagePlaceholderComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
