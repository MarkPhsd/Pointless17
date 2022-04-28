import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ManifestEditorHeaderComponent } from './manifest-editor-header.component';

describe('ManifestEditorHeaderComponent', () => {
  let component: ManifestEditorHeaderComponent;
  let fixture: ComponentFixture<ManifestEditorHeaderComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ ManifestEditorHeaderComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(ManifestEditorHeaderComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
