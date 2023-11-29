import { ComponentFixture, TestBed } from '@angular/core/testing';

import { BrandeditorComponent } from './brandeditor.component';

describe('BrandeditorComponent', () => {
  let component: BrandeditorComponent;
  let fixture: ComponentFixture<BrandeditorComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ BrandeditorComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(BrandeditorComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
