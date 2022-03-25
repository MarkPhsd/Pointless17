import { ComponentFixture, TestBed } from '@angular/core/testing';

import { StrainBoardComponent } from './strain-board.component';

describe('StrainBoardComponent', () => {
  let component: StrainBoardComponent;
  let fixture: ComponentFixture<StrainBoardComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ StrainBoardComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(StrainBoardComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
