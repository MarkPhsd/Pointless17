import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CpVIVO3300Component } from './cp-vivo3300.component';

describe('CpVIVO3300Component', () => {
  let component: CpVIVO3300Component;
  let fixture: ComponentFixture<CpVIVO3300Component>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ CpVIVO3300Component ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(CpVIVO3300Component);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
