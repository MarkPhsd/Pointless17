import { ComponentFixture, TestBed } from '@angular/core/testing';

import { MoveInventoryLocationComponent } from './move-inventory-location.component';

describe('MoveInventoryLocationComponent', () => {
  let component: MoveInventoryLocationComponent;
  let fixture: ComponentFixture<MoveInventoryLocationComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ MoveInventoryLocationComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(MoveInventoryLocationComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
