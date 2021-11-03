import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PromptWalkThroughComponent } from './prompt-walk-through.component';

describe('PromptWalkThroughComponent', () => {
  let component: PromptWalkThroughComponent;
  let fixture: ComponentFixture<PromptWalkThroughComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ PromptWalkThroughComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(PromptWalkThroughComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
