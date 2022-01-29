import { ComponentFixture, TestBed } from '@angular/core/testing';

import { BuildPdfComponent } from './build-pdf.component';

describe('BuildPdfComponent', () => {
  let component: BuildPdfComponent;
  let fixture: ComponentFixture<BuildPdfComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ BuildPdfComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(BuildPdfComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
