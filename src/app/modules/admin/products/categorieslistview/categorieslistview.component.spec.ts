import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { CategorieslistviewComponent } from './categoriestlistview.component';

describe('CategorieslistviewComponent', () => {
  let component: CategorieslistviewComponent;
  let fixture: ComponentFixture<CategorieslistviewComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ CategorieslistviewComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(CategorieslistviewComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
