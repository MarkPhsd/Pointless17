import { ComponentFixture, TestBed } from '@angular/core/testing';

import { BlogPostSortComponent } from './blog-post-sort.component';

describe('BlogPostSortComponent', () => {
  let component: BlogPostSortComponent;
  let fixture: ComponentFixture<BlogPostSortComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ BlogPostSortComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(BlogPostSortComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
