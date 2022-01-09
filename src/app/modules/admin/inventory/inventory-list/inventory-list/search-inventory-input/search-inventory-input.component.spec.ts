import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SearchInventoryInputComponent } from './search-inventory-input.component';

describe('SearchInventoryInputComponent', () => {
  let component: SearchInventoryInputComponent;
  let fixture: ComponentFixture<SearchInventoryInputComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ SearchInventoryInputComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(SearchInventoryInputComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
