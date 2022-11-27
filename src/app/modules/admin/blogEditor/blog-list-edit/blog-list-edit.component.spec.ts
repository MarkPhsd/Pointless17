import { ComponentFixture, TestBed } from '@angular/core/testing';

import { BlogListEditComponent } from './blog-list-edit.component';

describe('BlogListEditComponent', () => {
  let component: BlogListEditComponent;
  let fixture: ComponentFixture<BlogListEditComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ BlogListEditComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(BlogListEditComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
