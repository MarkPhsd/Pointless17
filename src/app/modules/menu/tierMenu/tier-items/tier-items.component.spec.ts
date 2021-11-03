import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TierItemsComponent } from './tier-items.component';

describe('TierItemsComponent', () => {
  let component: TierItemsComponent;
  let fixture: ComponentFixture<TierItemsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ TierItemsComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(TierItemsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
