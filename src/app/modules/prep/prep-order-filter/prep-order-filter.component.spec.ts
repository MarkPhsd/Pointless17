import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PrepOrderFilterComponent } from './prep-order-filter.component';

describe('PrepOrderFilterComponent', () => {
  let component: PrepOrderFilterComponent;
  let fixture: ComponentFixture<PrepOrderFilterComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ PrepOrderFilterComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(PrepOrderFilterComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
