import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ManifestTypeComponent } from './manifest-type.component';

describe('ManifestTypeComponent', () => {
  let component: ManifestTypeComponent;
  let fixture: ComponentFixture<ManifestTypeComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ ManifestTypeComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(ManifestTypeComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
