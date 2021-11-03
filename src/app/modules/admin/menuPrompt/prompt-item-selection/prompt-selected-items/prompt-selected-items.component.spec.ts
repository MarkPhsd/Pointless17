import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PromptSelectedItemsComponent } from './prompt-selected-items.component';

describe('PromptSelectedItemsComponent', () => {
  let component: PromptSelectedItemsComponent;
  let fixture: ComponentFixture<PromptSelectedItemsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ PromptSelectedItemsComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(PromptSelectedItemsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
