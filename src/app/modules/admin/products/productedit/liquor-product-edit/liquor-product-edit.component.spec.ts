import { ComponentFixture, TestBed } from '@angular/core/testing';

import { LiquorProductEditComponent } from './liquor-product-edit.component';

describe('LiquorProductEditComponent', () => {
  let component: LiquorProductEditComponent;
  let fixture: ComponentFixture<LiquorProductEditComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ LiquorProductEditComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(LiquorProductEditComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
