import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';

import { TabledsampledataComponent } from './tabledsampledata.component';

describe('TabledsampledataComponent', () => {
  let component: TabledsampledataComponent;
  let fixture: ComponentFixture<TabledsampledataComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [ TabledsampledataComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(TabledsampledataComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
