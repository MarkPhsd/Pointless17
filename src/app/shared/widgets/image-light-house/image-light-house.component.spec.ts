import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ImageLightHouseComponent } from './image-light-house.component';

describe('ImageLightHouseComponent', () => {
  let component: ImageLightHouseComponent;
  let fixture: ComponentFixture<ImageLightHouseComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ ImageLightHouseComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ImageLightHouseComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
