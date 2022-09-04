import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CardPointIDTECHAndroidComponent } from './card-point-idtechandroid.component';

describe('CardPointIDTECHAndroidComponent', () => {
  let component: CardPointIDTECHAndroidComponent;
  let fixture: ComponentFixture<CardPointIDTECHAndroidComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ CardPointIDTECHAndroidComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(CardPointIDTECHAndroidComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
