import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PromptPanelMenuItemsComponent } from './prompt-panel-menu-items.component';

describe('PromptPanelMenuItemsComponent', () => {
  let component: PromptPanelMenuItemsComponent;
  let fixture: ComponentFixture<PromptPanelMenuItemsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ PromptPanelMenuItemsComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(PromptPanelMenuItemsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
