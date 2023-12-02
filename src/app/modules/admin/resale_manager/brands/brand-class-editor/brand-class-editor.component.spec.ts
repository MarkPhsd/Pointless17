import { ComponentFixture, TestBed } from '@angular/core/testing';

import { BrandClassEditorComponent } from './brand-class-editor.component';

describe('BrandClassEditorComponent', () => {
  let component: BrandClassEditorComponent;
  let fixture: ComponentFixture<BrandClassEditorComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ BrandClassEditorComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(BrandClassEditorComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
