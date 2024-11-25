import { CommonModule } from '@angular/common';
import { Component, Input, OnInit, ViewEncapsulation } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { Observable } from 'rxjs';
import { of, switchMap } from 'rxjs';
import { BlogService } from 'src/app/_services/system/blog.service';
import { PlatformService } from 'src/app/_services/system/platform.service';
import { UISettingsService, UIHomePageSettings } from 'src/app/_services/system/settings/uisettings.service';
import { AppMaterialModule } from 'src/app/app-material.module';
import { SharedPipesModule } from 'src/app/shared-pipes/shared-pipes.module';

@Component({
  selector: 'app-blog-post',
  standalone: true,
  imports: [CommonModule,AppMaterialModule,FormsModule,ReactiveFormsModule,

  SharedPipesModule],
  templateUrl: './blog-post.component.html',
  styleUrls: ['./blog-post.component.scss'],
  // encapsulation: ViewEncapsulation.None,
})
export class BlogPostComponent implements OnInit {

  action$: Observable<any>;
  @Input() slug: string;

  constructor(
                private blogService     : BlogService,
                public route            : ActivatedRoute,
                private uiSettings      : UISettingsService,
                private platformService: PlatformService,
  ) {
  }

  ngOnInit(): void {
    if (this.platformService.isApp()) { return }
    if (this.slug) {
      const home$ = this.getHomePageSettings();
      this.action$ = home$.pipe(switchMap(data => {
        return this.blogService.getBlogPost(data.wordpressHeadless, this.slug).pipe(switchMap(data => {
          console.log(data.results)
          if (data.results) {
            data.results.filter(item => { return item.enabled == true});
            console.log(data)
          }
          return of(data)
        }))
     }))
    }
  }

  getHomePageSettings() {
    if (this.uiSettings.homePageSetting){
      return of(this.uiSettings.homePageSetting)
    }
    return this.uiSettings.getSetting('UIHomePageSettings').pipe(
      switchMap( data => {
        if (data) {
          const item  = JSON.parse(data.text) as UIHomePageSettings;
          this.uiSettings.updateHomePageSetting(item)
          return of(item)
        }
        return of(null)
      }
    ))
  }

}
