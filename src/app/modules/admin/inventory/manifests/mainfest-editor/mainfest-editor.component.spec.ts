import { ComponentFixture, TestBed } from '@angular/core/testing';

import { MainfestEditorComponent } from './mainfest-editor.component';

describe('MainfestEditorComponent', () => {
  let component: MainfestEditorComponent;
  let fixture: ComponentFixture<MainfestEditorComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ MainfestEditorComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(MainfestEditorComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
