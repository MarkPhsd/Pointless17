import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ManifestsComponent } from './manifests.component';

describe('ManifestsComponent', () => {
  let component: ManifestsComponent;
  let fixture: ComponentFixture<ManifestsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ ManifestsComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(ManifestsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
