import { ComponentFixture, TestBed } from '@angular/core/testing';

import { StrainPackagesComponent } from './strain-packages.component';

describe('StrainPackagesComponent', () => {
  let component: StrainPackagesComponent;
  let fixture: ComponentFixture<StrainPackagesComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ StrainPackagesComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(StrainPackagesComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
