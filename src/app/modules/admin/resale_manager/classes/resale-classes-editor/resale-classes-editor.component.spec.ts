import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ResaleClassesEditorComponent } from './resale-classes-editor.component';

describe('ResaleClassesEditorComponent', () => {
  let component: ResaleClassesEditorComponent;
  let fixture: ComponentFixture<ResaleClassesEditorComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ ResaleClassesEditorComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ResaleClassesEditorComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
