import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PromptSubGroupAssociationComponent } from './prompt-sub-group-association.component';

describe('PromptSubGroupAssociationComponent', () => {
  let component: PromptSubGroupAssociationComponent;
  let fixture: ComponentFixture<PromptSubGroupAssociationComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ PromptSubGroupAssociationComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(PromptSubGroupAssociationComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
