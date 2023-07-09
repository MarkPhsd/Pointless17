import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PreviewFurnitureComponent } from './preview-furniture.component';

describe('PreviewFurnitureComponent', () => {
  let component: PreviewFurnitureComponent;
  let fixture: ComponentFixture<PreviewFurnitureComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ PreviewFurnitureComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(PreviewFurnitureComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
