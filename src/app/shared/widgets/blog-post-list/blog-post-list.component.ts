import { Component, Input, OnInit, TemplateRef, ViewChild, ViewEncapsulation } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { platform } from 'os';
import { switchMap, of, catchError, Observable, forkJoin } from 'rxjs';
import { SitesService } from 'src/app/_services/reporting/sites.service';
import { BlogService, IBlog, ISearchBlogs } from 'src/app/_services/system/blog.service';
import { PlatformService } from 'src/app/_services/system/platform.service';
import { UIHomePageSettings, UISettingsService } from 'src/app/_services/system/settings/uisettings.service';

@Component({
  selector: 'blog-post-list',
  templateUrl: './blog-post-list.component.html',
  styleUrls: ['./blog-post-list.component.scss'],
  // encapsulation: ViewEncapsulation.None,
})
export class BlogPostListComponent implements OnInit {

  @ViewChild('listView')      listView: TemplateRef<any>;
  @ViewChild('gridView')      gridView: TemplateRef<any>;

  @Input() viewType = 'list';
  @Input() group = '';
  @Input() class = 'cards';
  @Input() height = '400px';
  
  blogs: IBlog[];
  blogs$: Observable<any>;
  obs$ : Observable<any>[];
  uiHomePageSetting$    : Observable<UIHomePageSettings>;
  @Input() homePageSettings : UIHomePageSettings;
  blogPost$ : Observable<any>;
  blogContent: string;
  slug: string;
  action$ : Observable<any>;

  gridClass = 'grid-class'
  constructor( private siteService     : SitesService,
               private blogService     : BlogService,
               public route            : ActivatedRoute,
               private platformService: PlatformService,
               private uiSettings : UISettingsService,
  ) {
    const group = this.route.snapshot.paramMap.get('group');
    if (group) { 
      this.group = group;
    }
    const viewType  = this.route.snapshot.paramMap.get('viewType');
    if (viewType) { 
      this.viewType = viewType;
    }
  }

  ngOnInit(): void {
    if (this.platformService.isApp()) { return }
    this.refreshList()
  }

  getHomePageSettings() {
    if (this.homePageSettings){ 
      return of(this.homePageSettings)
    }
    if (this.uiSettings.homePageSetting){ 
      this.homePageSettings = this.uiSettings.homePageSetting
      return of(this.uiSettings.homePageSetting)
    }
    return this.uiSettings.getSetting('UIHomePageSettings').pipe(
      switchMap( data => {
        if (data) {
          this.homePageSettings  = JSON.parse(data.text) as UIHomePageSettings;
          this.uiSettings.updateHomePageSetting(this.homePageSettings)
          return of(this.homePageSettings)
        }
        return of(null)
      }
    ))
  }

  refreshList() {
    const site = this.siteService.getAssignedSite();
    const search = {} as ISearchBlogs;
    search.group = this.group;
    search.enabled = true;
    const homePage$ = this.getHomePageSettings();

    this.blogs$ = 
        homePage$.pipe(switchMap( data => { 
          // console.log('search Group', search, data.wordpressHeadless)
          return this.blogService.searchBlogs( site, search )
        })).pipe(
          switchMap( data => {
              data.results.filter(item => { return item.enabled == true});
              this.blogs = data.results.sort((a, b) => (a.sort > b.sort ? 1 : -1));
              return of(this.blogs)
            }
          ),
          catchError(err => {
            console.log(err)
            return of(err)
          })
        ).pipe(switchMap(data => { 
            this.obs$ = []
            if (!data || !data) {
              return of('no menu')
            }
            const list  = data;
            const url = this.homePageSettings.wordpressHeadless
            list.forEach(item => {
              if (item.link) {
                this.obs$.push(this.blogService.getBlogPost(url, item.link))
              }
            });
            forkJoin(this.obs$)
            return  forkJoin(this.obs$)
        }))
      }

  get blogView() {
    if ( this.viewType === 'list' ) {
      return this.listView
    }
    if ( this.viewType === 'grid' ) {
      return this.gridView
    }
    return null;
  }
}
