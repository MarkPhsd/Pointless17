import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PackageActionsComponent } from './package-actions.component';

describe('PackageActionsComponent', () => {
  let component: PackageActionsComponent;
  let fixture: ComponentFixture<PackageActionsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ PackageActionsComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(PackageActionsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
