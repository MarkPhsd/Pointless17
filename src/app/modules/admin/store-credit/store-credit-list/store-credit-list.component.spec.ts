import { ComponentFixture, TestBed } from '@angular/core/testing';

import { StoreCreditListComponent } from './store-credit-list.component';

describe('StoreCreditListComponent', () => {
  let component: StoreCreditListComponent;
  let fixture: ComponentFixture<StoreCreditListComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ StoreCreditListComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(StoreCreditListComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
