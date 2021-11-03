import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AdjustItemNoteComponent } from './adjust-item-note.component';

describe('AdjustItemNoteComponent', () => {
  let component: AdjustItemNoteComponent;
  let fixture: ComponentFixture<AdjustItemNoteComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ AdjustItemNoteComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(AdjustItemNoteComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
