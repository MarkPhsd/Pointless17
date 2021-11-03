import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PromptSubGroupEditComponent } from './prompt-sub-group-edit.component';

describe('PromptSubGroupEditComponent', () => {
  let component: PromptSubGroupEditComponent;
  let fixture: ComponentFixture<PromptSubGroupEditComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ PromptSubGroupEditComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(PromptSubGroupEditComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
