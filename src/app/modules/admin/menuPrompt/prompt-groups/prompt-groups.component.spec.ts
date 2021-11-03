import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PromptGroupsComponent } from './prompt-groups.component';

describe('PromptGroupsComponent', () => {
  let component: PromptGroupsComponent;
  let fixture: ComponentFixture<PromptGroupsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ PromptGroupsComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(PromptGroupsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
