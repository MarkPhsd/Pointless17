import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ManifestStatusComponent } from './manifest-status.component';

describe('ManifestStatusComponent', () => {
  let component: ManifestStatusComponent;
  let fixture: ComponentFixture<ManifestStatusComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ ManifestStatusComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(ManifestStatusComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
