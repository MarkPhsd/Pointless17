import { ComponentFixture, TestBed } from '@angular/core/testing';

import { StoreCreditEditorComponent } from './store-credit-editor.component';

describe('StoreCreditEditorComponent', () => {
  let component: StoreCreditEditorComponent;
  let fixture: ComponentFixture<StoreCreditEditorComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ StoreCreditEditorComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(StoreCreditEditorComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
