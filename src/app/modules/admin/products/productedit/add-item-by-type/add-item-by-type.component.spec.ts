import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AddItemByTypeComponent } from './add-item-by-type.component';

describe('AddItemByTypeComponent', () => {
  let component: AddItemByTypeComponent;
  let fixture: ComponentFixture<AddItemByTypeComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ AddItemByTypeComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(AddItemByTypeComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
