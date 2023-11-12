import { ComponentFixture, TestBed } from '@angular/core/testing';

import { BotTreeViewComponent } from './bot-tree-view.component';

describe('BotTreeViewComponent', () => {
  let component: BotTreeViewComponent;
  let fixture: ComponentFixture<BotTreeViewComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ BotTreeViewComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(BotTreeViewComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
