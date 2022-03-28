import { ComponentFixture, TestBed } from '@angular/core/testing';

import { GridMenuLayoutComponent } from './grid-menu-layout.component';

describe('GridMenuLayoutComponent', () => {
  let component: GridMenuLayoutComponent;
  let fixture: ComponentFixture<GridMenuLayoutComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ GridMenuLayoutComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(GridMenuLayoutComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
