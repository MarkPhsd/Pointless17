import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PromptPanelMenuItemComponent } from './prompt-panel-menu-item.component';

describe('PromptPanelMenuItemComponent', () => {
  let component: PromptPanelMenuItemComponent;
  let fixture: ComponentFixture<PromptPanelMenuItemComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ PromptPanelMenuItemComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(PromptPanelMenuItemComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
