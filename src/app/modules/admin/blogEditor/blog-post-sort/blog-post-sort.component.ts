import { CdkDragDrop, moveItemInArray } from '@angular/cdk/drag-drop';
import { Component, Input, OnInit } from '@angular/core';
import { MatLegacySnackBar as MatSnackBar } from '@angular/material/legacy-snack-bar';
import { catchError, Observable, of, Subject, switchMap } from 'rxjs';
import { SitesService } from 'src/app/_services/reporting/sites.service';
import { BlogService, IBlog, IBlogResults, ISearchBlogs } from 'src/app/_services/system/blog.service';

@Component({
  selector: 'blog-post-sort',
  templateUrl: './blog-post-sort.component.html',
  styleUrls: ['./blog-post-sort.component.scss'],
})
export class BlogPostSortComponent implements OnInit {

  @Input()  group : string;
  @Input()  blogs : IBlog[];
  @Input() _Blogs  : Subject<IBlog[]>;
  
  blog  : IBlog;
  blogs$: Observable<IBlogResults>;
  index: number;
  save$: Observable<any>;

  constructor(  private siteService     : SitesService,
                private _snackBar      : MatSnackBar,
                private blogService     : BlogService,) { }

  ngOnInit(): void {
    // this.refreshList()l
    const i = 0;

    if (this._Blogs) {
      this._Blogs.subscribe(data => {
        if (!data) { return }
        if (data.length == 0) { return }
        this.blogs = data.sort((a , b) => (+a.sort > +b.sort) ? 1: -1)
      })
    }
  }

  refreshList() {
    const site = this.siteService.getAssignedSite();
    const search = {} as ISearchBlogs;
    search.group = this.group;

    this.blogs$ = this.blogService.searchBlogs(site, search ).pipe(
      switchMap( data => {
        this.blogs = data.results.sort((a, b) => (a.sort > b.sort ? 1 : -1));
          return of(this.blogs)
        }
      ),
      catchError(err => {
        this.notifyEvent('error occured.' + err, 'Alert')
        return of(err)
      })
    )
  }

  ngDestroy() {
    const i = 0
  }

  initList(list: IBlog[]) {
    if (list) {
      list = list.sort((a , b) => (+a.sort > +b.sort) ? 1: -1)
    }
  }

  assignItem(item, index) {
    if (item) {
      this.blog  = item
      this.index = index
    }
  }

  drop(event: CdkDragDrop<string[]>) {
    if (this.blogs) {
      moveItemInArray(this.blogs, event.previousIndex, event.currentIndex);
      this.saveMenu()
    }
  }

  saveMenu() {
    const site = this.siteService.getAssignedSite();
    if (this.blogs) {
      this.save$  = this.blogService.putBlogList(site, this.blogs).pipe(
          switchMap(data => {
            if (!data) { return of(null)}
            data.sort((a, b) => (a.sort > b.sort ? 1 : -1));
            // console.log('data Sort', data)
            this.blogs  = data.filter(data => { 
              return data.group === this.group
            })
            // console.log('data filter', data)
            return of(this.blogs)
          }
        ),
        catchError(err => {
          console.log(err)
          this.notifyEvent('error occured.' + err, 'Alert')
          return of(err)
        })
      )
    }
  }

  notifyEvent(message: string, action: string) {
    this._snackBar.open(message, action, {
      duration: 2000,
      verticalPosition: 'top'
    });
  }


}

