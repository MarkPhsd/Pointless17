import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PackageSearchSelectorComponent } from './package-search-selector.component';

describe('PackageSearchSelectorComponent', () => {
  let component: PackageSearchSelectorComponent;
  let fixture: ComponentFixture<PackageSearchSelectorComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ PackageSearchSelectorComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(PackageSearchSelectorComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
