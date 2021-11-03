import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PromptSubGroupsComponent } from './prompt-sub-groups.component';

describe('PromptSubGroupsComponent', () => {
  let component: PromptSubGroupsComponent;
  let fixture: ComponentFixture<PromptSubGroupsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ PromptSubGroupsComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(PromptSubGroupsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
