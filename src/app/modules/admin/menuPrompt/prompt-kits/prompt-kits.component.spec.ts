import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PromptKitsComponent } from './prompt-kits.component';

describe('PromptKitsComponent', () => {
  let component: PromptKitsComponent;
  let fixture: ComponentFixture<PromptKitsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ PromptKitsComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(PromptKitsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
