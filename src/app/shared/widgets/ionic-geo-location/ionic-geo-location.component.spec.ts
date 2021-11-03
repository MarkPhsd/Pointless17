import { ComponentFixture, TestBed } from '@angular/core/testing';

import { IonicGeoLocationComponent } from './ionic-geo-location.component';

describe('IonicGeoLocationComponent', () => {
  let component: IonicGeoLocationComponent;
  let fixture: ComponentFixture<IonicGeoLocationComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ IonicGeoLocationComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(IonicGeoLocationComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
