import { Component, Inject, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';
import { switchMap, of, Observable, catchError } from 'rxjs';
import { SitesService } from 'src/app/_services/reporting/sites.service';
import { BlogService, IBlog } from 'src/app/_services/system/blog.service';
import { SettingsService } from 'src/app/_services/system/settings.service';
import { UIHomePageSettings, UISettingsService } from 'src/app/_services/system/settings/uisettings.service';

@Component({
  selector: 'app-blog-post-edit',
  templateUrl: './blog-post-edit.component.html',
  styleUrls: ['./blog-post-edit.component.scss']
})
export class BlogPostEditComponent implements OnInit {

  blog                : IBlog;
  action$             : Observable<any>;
  inputForm           : FormGroup;
  message             =  ""
  performingAction    = false;
  group               : string;
  groups              = this.blogService.groups;
  uiHomePageSetting$    : Observable<UIHomePageSettings>;
  homePageSetings : UIHomePageSettings;
  blogPost$ : Observable<any>;
  blogContent: string;
  slug: string;

  errrMessage: string;

  constructor(private fb: FormBuilder,
              private blogService: BlogService,
              private siteService: SitesService,
              private _snackBar: MatSnackBar,
              private uiSettings : UISettingsService,
              private dialogRef: MatDialogRef<BlogPostEditComponent>,
              @Inject(MAT_DIALOG_DATA) public data: any) {

  const site = siteService.getAssignedSite();

  if (!data || !data.id) {
    this.blog = {} as IBlog;
    this.initForm(this.blog)
    return;
  }

  const homePage$ = this.getHomePageSettings();
  this.performingAction = true;

  this.action$ = homePage$.pipe(
    switchMap(homte => {
      return this.blogService.getBlog(site, data.id)
    })).pipe(
      switchMap( data => {
        this.initForm(data)
        this.performingAction = false
        return of(data)
      }
    ),
    catchError(
        switchMap( error => {
          this.performingAction = false
          this.notifyEvent('Error ' + error, 'Error')
          return of(Error)
        }
      )
    )
  )

}

  ngOnInit(): void {
    const i = 0;

  }

  getHomePageSettings() {
    return this.uiSettings.getSetting('UIHomePageSettings').pipe(
      switchMap( data => {
        if (data) {
          this.homePageSetings  = JSON.parse(data.text) as UIHomePageSettings;
          this.uiSettings.updateHomePageSetting(this.homePageSetings)
          return of(this.homePageSetings)
        }
        return of(null)
      }
    ))
  }

  copyItem(event)  {

  }

  initForm(data) {

    if (!data) { return };
    this.blog = data;

    this.group = 'empty';

    if (data && data?.group) {
      this.group = data?.group
    }

    this.inputForm = this.fb.group(
      {
        id     : [],
        name   : [  ,[Validators.required, Validators.max(50)]],
        sort   : [],
        group  : [],
        link   : [],
        enabled: []
      }
    )

    this.blog = data as IBlog;
    this.inputForm.patchValue(data);
    this.getBlogPost(data?.link)
  }

  outPutList(event) {
    const item = event;
    const value = JSON.stringify(item);
    this.inputForm.patchValue({menuSections: value})
  }

  setType(group) {
    this.group = group;
    this.inputForm.patchValue({group: this.group})
  }

  updateItem(event): Observable<IBlog> {
    const site = this.siteService.getAssignedSite()

    this.message = ""
    this.performingAction= true;

    if (!this.inputForm.valid) {
      this.notifyEvent('Something is wrong with the form. Please confirm', 'Alert')
      return of(null)
    }

    this.blog  = this.inputForm.value as IBlog;
    // this.blog.group       = this.group;
    const item$ = this.blogService.save(site, this.blog);
    return item$.pipe(
      switchMap(
        data => {
          this.blog = data;
          if (!this.blog.sort) { this.blog.sort = 1;}
          this.getBlogPost(data?.link)
          this.notifyEvent('Item Updated', 'Success');
          this.performingAction = false;
          return of(data);
        }
    ))
  };

  getBlogPost(slug: string) {
    this.slug = slug;
    if (this.homePageSetings && this.homePageSetings.wordpressHeadless) {
      this.blogPost$ = this.blogService.getBlogPost(this.homePageSetings.wordpressHeadless, slug).pipe(
        switchMap(data => {
          this.blogContent = data[0]?.content?.rendered;
          console.log(this.blogContent )
          return of(this.blogContent )
      })
      )
    }
  }

  updateSave(event) {
    this.action$ = this.updateItem(event);
  }

  onCancel(event) {
    this.dialogRef.close({complete: true});
  }

  updateItemExit(event) {
    this.performingAction = true
    this.action$ = this.updateItem(event).pipe(
      switchMap ( data => {
        this.performingAction = false;
        this.onCancel(event);
        return of(data);
      }),
      catchError(
          switchMap( error => {
            this.performingAction = false
            this.notifyEvent('Error ' + error, 'Error')
            return of(Error)
          }
        )
      )
    );
  };

  deleteItem(event) {
    const site = this.siteService.getAssignedSite()
    if (!this.blog || !this.blog.id ) {
      this._snackBar.open("No item Selected", "Success")
       return
    }

    this.blogService.delete(site, this.blog.id).subscribe( data =>{
      this._snackBar.open("Item deleted", "Success")
      this.onCancel(event)
    })
  }

  notifyEvent(message: string, action: string) {
    this._snackBar.open(message, action, {
      duration: 2000,
      verticalPosition: 'top'
    });
  }

}
