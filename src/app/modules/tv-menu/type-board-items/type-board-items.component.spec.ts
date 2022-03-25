import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TypeBoardItemsComponent } from './type-board-items.component';

describe('TypeBoardItemsComponent', () => {
  let component: TypeBoardItemsComponent;
  let fixture: ComponentFixture<TypeBoardItemsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ TypeBoardItemsComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(TypeBoardItemsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
