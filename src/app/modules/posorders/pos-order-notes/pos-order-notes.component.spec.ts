import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PosOrderNotesComponent } from './pos-order-notes.component';

describe('PosOrderNotesComponent', () => {
  let component: PosOrderNotesComponent;
  let fixture: ComponentFixture<PosOrderNotesComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ PosOrderNotesComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(PosOrderNotesComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
