import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CategoryItemsBoardComponent } from './category-items-board.component';

describe('CategoryItemsBoardComponent', () => {
  let component: CategoryItemsBoardComponent;
  let fixture: ComponentFixture<CategoryItemsBoardComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ CategoryItemsBoardComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(CategoryItemsBoardComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
