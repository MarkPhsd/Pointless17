import { Component, OnInit, Input, OnChanges, Inject } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { MatSnackBar } from '@angular/material/snack-bar';
import { FbNavMenuService } from 'src/app/_form-builder/fb-nav-menu.service';
import { SubMenu }  from 'src/app/_interfaces/index';
import { SitesService } from 'src/app/_services/reporting/sites.service';
import { Observable } from 'rxjs';
import { MenusService } from 'src/app/_services/system/menus.service';
import { MatDialog, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';

@Component({
  selector: 'app-menu-group-item-edit',
  templateUrl: './menu-group-item-edit.component.html',
  styleUrls: ['./menu-group-item-edit.component.scss'],
  providers: [
    { provide: MAT_DIALOG_DATA, useValue: {} },
    { provide: MatDialogRef, useValue: {} }
  ]
})
export class MenuGroupItemEditComponent implements OnInit, OnChanges {

  @Input() item$          : Observable<SubMenu>;
  @Input() item           : SubMenu;
  @Input() id             : number;
  inputForm               : FormGroup;
  minimized                  : boolean;
  accordionID             : number;
  menugroupID: number;

  constructor(
    private fbNavService: FbNavMenuService,
    private fb: FormBuilder,
    private siteService            : SitesService,
    private _snackBar              : MatSnackBar,
    private menusService           : MenusService,
    private dialogRef              : MatDialogRef<MenuGroupItemEditComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any,
  )

  {
    console.log('data in component', data)
    if (data) {
      this.accordionID = data.accordionID;
      this.id = data.id;
      console.log(this.accordionID)
      this.menugroupID = data.menuID
      console.log(data)
    }
  }

  ngOnInit() {
    this.inputForm = this.fbNavService.initSubMenuForm(this.inputForm);
    this.refreshData();
  }

  ngOnChanges(): void {
    //Called before any other lifecycle hook. Use it to inject dependencies, but avoid any serious work here.
    //Add '${implements OnChanges}' to the class.
    this.refreshData();
  }

  refreshData() {
    const site = this.siteService.getAssignedSite();
    if (this.id != 0) {
      const item$ = this.menusService.getSubMenuByID(site, this.id);
      item$.subscribe( data => {
        this.item = data
        this.minimized = this.item.minimized
        this.refreshForm()
        return
      })
    }
    this.refreshForm()
  }

  refreshForm() {
    console.log('refreshForm', this.item)
    if (this.item) {
      this.inputForm.patchValue(this.item)
      this.minimized = this.item.minimized;
    }
    if (!this.item) {
      this.minimized = false
    }
  }

  save() {
    const site = this.siteService.getAssignedSite()
    if (this.inputForm.valid) {
      this.item = this.inputForm.value
      this.item.minimized = this.minimized
      let item$: any;

      if (this.id != undefined && this.id != 0) {
         item$ = this.menusService.putSubMenuByID(site, this.item.id, this.item)
         this.savechanges(item$)
      }

      if (this.id == 0 || this.id == undefined) {
        this.item.menuID = this.accordionID
        item$ = this.menusService.postSubMenuItem(site, this.item)
        this.savechanges(item$)
      }

    }
  }

  savechanges(item$: Observable<SubMenu>) {
    item$.subscribe(
      {
          next: data=> {
          this._snackBar.open('Item saved', 'Success', {duration: 2000})
        },
        error : err => {
          this._snackBar.open('Item not saved', 'Failure', {duration: 2000})
          console.log(err)
        }
      }
    )

  }


}
