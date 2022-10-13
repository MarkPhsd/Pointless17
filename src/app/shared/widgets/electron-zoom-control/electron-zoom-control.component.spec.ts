import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ElectronZoomControlComponent } from './electron-zoom-control.component';

describe('ElectronZoomControlComponent', () => {
  let component: ElectronZoomControlComponent;
  let fixture: ComponentFixture<ElectronZoomControlComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ ElectronZoomControlComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(ElectronZoomControlComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
