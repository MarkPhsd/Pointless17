import { ComponentFixture, TestBed } from '@angular/core/testing';

import { GridManagerComponent } from './grid-manager.component';

describe('GridManagerComponent', () => {
  let component: GridManagerComponent;
  let fixture: ComponentFixture<GridManagerComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ GridManagerComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(GridManagerComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
