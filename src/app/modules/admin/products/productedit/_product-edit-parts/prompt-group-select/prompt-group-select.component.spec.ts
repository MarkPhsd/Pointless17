import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PromptGroupSelectComponent } from './prompt-group-select.component';

describe('PromptGroupSelectComponent', () => {
  let component: PromptGroupSelectComponent;
  let fixture: ComponentFixture<PromptGroupSelectComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ PromptGroupSelectComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(PromptGroupSelectComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
