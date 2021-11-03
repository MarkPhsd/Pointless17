import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PromptItemsSelectedComponent } from './prompt-items-selected.component';

describe('PromptItemsSelectedComponent', () => {
  let component: PromptItemsSelectedComponent;
  let fixture: ComponentFixture<PromptItemsSelectedComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ PromptItemsSelectedComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(PromptItemsSelectedComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
