import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DsiEMVAndroidComponent } from './dsi-emvandroid.component';

describe('DsiEMVAndroidComponent', () => {
  let component: DsiEMVAndroidComponent;
  let fixture: ComponentFixture<DsiEMVAndroidComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ DsiEMVAndroidComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(DsiEMVAndroidComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
