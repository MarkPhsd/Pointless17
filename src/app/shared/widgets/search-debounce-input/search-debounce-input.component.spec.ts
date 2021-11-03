import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SearchDebounceInputComponent } from './search-debounce-input.component';

describe('SearchDebounceInputComponent', () => {
  let component: SearchDebounceInputComponent;
  let fixture: ComponentFixture<SearchDebounceInputComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ SearchDebounceInputComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(SearchDebounceInputComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
