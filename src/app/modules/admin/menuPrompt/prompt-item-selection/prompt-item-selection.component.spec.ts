import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PromptItemSelectionComponent } from './prompt-item-selection.component';

describe('PromptItemSelectionComponent', () => {
  let component: PromptItemSelectionComponent;
  let fixture: ComponentFixture<PromptItemSelectionComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ PromptItemSelectionComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(PromptItemSelectionComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
