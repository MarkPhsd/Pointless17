import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PromptGroupEditComponent } from './prompt-group-edit.component';

describe('PromptGroupEditComponent', () => {
  let component: PromptGroupEditComponent;
  let fixture: ComponentFixture<PromptGroupEditComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ PromptGroupEditComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(PromptGroupEditComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
