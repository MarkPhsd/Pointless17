import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PromptInfoPanelComponent } from './prompt-info-panel.component';

describe('PromptInfoPanelComponent', () => {
  let component: PromptInfoPanelComponent;
  let fixture: ComponentFixture<PromptInfoPanelComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ PromptInfoPanelComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(PromptInfoPanelComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
