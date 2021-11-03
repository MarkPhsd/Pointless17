import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PromptSubGroupPanelComponent } from './prompt-sub-group-panel.component';

describe('PromptSubGroupPanelComponent', () => {
  let component: PromptSubGroupPanelComponent;
  let fixture: ComponentFixture<PromptSubGroupPanelComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ PromptSubGroupPanelComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(PromptSubGroupPanelComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
