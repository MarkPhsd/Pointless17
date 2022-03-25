import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TypeBoardComponent } from './type-board.component';

describe('TypeBoardComponent', () => {
  let component: TypeBoardComponent;
  let fixture: ComponentFixture<TypeBoardComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ TypeBoardComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(TypeBoardComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
