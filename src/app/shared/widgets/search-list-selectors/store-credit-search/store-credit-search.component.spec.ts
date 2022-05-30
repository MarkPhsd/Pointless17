import { ComponentFixture, TestBed } from '@angular/core/testing';

import { StoreCreditSearchComponent } from './store-credit-search.component';

describe('StoreCreditSearchComponent', () => {
  let component: StoreCreditSearchComponent;
  let fixture: ComponentFixture<StoreCreditSearchComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ StoreCreditSearchComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(StoreCreditSearchComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
