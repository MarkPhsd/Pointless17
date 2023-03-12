import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ValueFromListSelectorComponent } from './value-from-list-selector.component';

describe('ValueFromListSelectorComponent', () => {
  let component: ValueFromListSelectorComponent;
  let fixture: ComponentFixture<ValueFromListSelectorComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ ValueFromListSelectorComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(ValueFromListSelectorComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
