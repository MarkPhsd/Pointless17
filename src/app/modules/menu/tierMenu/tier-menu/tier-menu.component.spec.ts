import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TierMenuComponent } from './tier-menu.component';

describe('TierMenuComponent', () => {
  let component: TierMenuComponent;
  let fixture: ComponentFixture<TierMenuComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ TierMenuComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(TierMenuComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
