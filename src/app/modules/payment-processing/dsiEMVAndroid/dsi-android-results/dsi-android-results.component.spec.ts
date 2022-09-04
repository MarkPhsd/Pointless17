import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DsiAndroidResultsComponent } from './dsi-android-results.component';

describe('DsiAndroidResultsComponent', () => {
  let component: DsiAndroidResultsComponent;
  let fixture: ComponentFixture<DsiAndroidResultsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ DsiAndroidResultsComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(DsiAndroidResultsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
