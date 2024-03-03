import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PosOrderEditorComponent } from './pos-order-editor.component';

describe('PosOrderEditorComponent', () => {
  let component: PosOrderEditorComponent;
  let fixture: ComponentFixture<PosOrderEditorComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ PosOrderEditorComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(PosOrderEditorComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
