import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SmokeProductEditComponent } from './smoke-product-edit.component';

describe('SmokeProductEditComponent', () => {
  let component: SmokeProductEditComponent;
  let fixture: ComponentFixture<SmokeProductEditComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ SmokeProductEditComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(SmokeProductEditComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
