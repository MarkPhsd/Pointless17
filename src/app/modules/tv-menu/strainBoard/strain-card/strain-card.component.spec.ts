import { ComponentFixture, TestBed } from '@angular/core/testing';

import { StrainCardComponent } from './strain-card.component';

describe('StrainCardComponent', () => {
  let component: StrainCardComponent;
  let fixture: ComponentFixture<StrainCardComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ StrainCardComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(StrainCardComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
