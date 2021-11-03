import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { SitepurchasesComponent } from './sitepurchases.component';

describe('SitepurchasesComponent', () => {
  let component: SitepurchasesComponent;
  let fixture: ComponentFixture<SitepurchasesComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ SitepurchasesComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(SitepurchasesComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
