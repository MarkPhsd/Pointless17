import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SiteEditFormComponent } from './site-edit-form.component';

describe('SiteEditFormComponent', () => {
  let component: SiteEditFormComponent;
  let fixture: ComponentFixture<SiteEditFormComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ SiteEditFormComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(SiteEditFormComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
