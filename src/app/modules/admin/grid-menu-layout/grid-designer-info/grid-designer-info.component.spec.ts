import { ComponentFixture, TestBed } from '@angular/core/testing';

import { GridDesignerInfoComponent } from './grid-designer-info.component';

describe('GridDesignerInfoComponent', () => {
  let component: GridDesignerInfoComponent;
  let fixture: ComponentFixture<GridDesignerInfoComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ GridDesignerInfoComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(GridDesignerInfoComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
