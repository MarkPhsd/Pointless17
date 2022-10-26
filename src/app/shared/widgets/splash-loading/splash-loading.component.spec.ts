import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SplashLoadingComponent } from './splash-loading.component';

describe('SplashLoadingComponent', () => {
  let component: SplashLoadingComponent;
  let fixture: ComponentFixture<SplashLoadingComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ SplashLoadingComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(SplashLoadingComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
