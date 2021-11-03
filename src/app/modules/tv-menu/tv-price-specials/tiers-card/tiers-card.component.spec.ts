import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TiersCardComponent } from './tiers-card.component';

describe('TiersCardComponent', () => {
  let component: TiersCardComponent;
  let fixture: ComponentFixture<TiersCardComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ TiersCardComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(TiersCardComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
