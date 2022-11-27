import { Component, OnInit } from '@angular/core';
import { BlogService } from 'src/app/_services/system/blog.service';

@Component({
  selector: 'app-blog-post-list',
  templateUrl: './blog-post-list.component.html',
  styleUrls: ['./blog-post-list.component.scss']
})
export class BlogPostListComponent implements OnInit {

  viewType = 'list';

  constructor(private blogsService: BlogService) { }

  ngOnInit(): void {
    const i = 0
  }

}
