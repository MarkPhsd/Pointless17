import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { AppMaterialModule } from 'src/app/app-material.module';
import { SharedPipesModule } from 'src/app/shared-pipes/shared-pipes.module';
import { BlogPostListComponent } from '../../widgets/blog-post-list/blog-post-list.component';

@Component({
  selector: 'app-site-footer',
  standalone: true,
  imports: [CommonModule,AppMaterialModule,SharedPipesModule,BlogPostListComponent],
  templateUrl: './site-footer.component.html',
  styleUrls: ['./site-footer.component.scss']
})
export class SiteFooterComponent implements OnInit {
  matToolbarColor = 'primary';
  mattoolbar      = 'mat-toolbar';

  constructor() { }

  ngOnInit(): void {
    const i = 0;
  }

}
