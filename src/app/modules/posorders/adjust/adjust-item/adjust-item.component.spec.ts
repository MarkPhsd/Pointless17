import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AdjustItemComponent } from './adjust-item.component';

describe('AdjustItemComponent', () => {
  let component: AdjustItemComponent;
  let fixture: ComponentFixture<AdjustItemComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ AdjustItemComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(AdjustItemComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
