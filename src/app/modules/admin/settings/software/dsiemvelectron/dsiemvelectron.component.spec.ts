import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DSIEMVElectronComponent } from './dsiemvelectron.component';

describe('DSIEMVElectronComponent', () => {
  let component: DSIEMVElectronComponent;
  let fixture: ComponentFixture<DSIEMVElectronComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ DSIEMVElectronComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(DSIEMVElectronComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
