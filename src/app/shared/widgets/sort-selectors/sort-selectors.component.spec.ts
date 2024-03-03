import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SortSelectorsComponent } from './sort-selectors.component';

describe('SortSelectorsComponent', () => {
  let component: SortSelectorsComponent;
  let fixture: ComponentFixture<SortSelectorsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ SortSelectorsComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(SortSelectorsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
