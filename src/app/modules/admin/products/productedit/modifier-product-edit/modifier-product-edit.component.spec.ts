import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ModifierProductEditComponent } from './modifier-product-edit.component';

describe('ModifierProductEditComponent', () => {
  let component: ModifierProductEditComponent;
  let fixture: ComponentFixture<ModifierProductEditComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ ModifierProductEditComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(ModifierProductEditComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
