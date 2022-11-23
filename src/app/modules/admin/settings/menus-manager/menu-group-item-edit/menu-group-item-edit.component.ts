import { Component, OnInit, Input, OnChanges, Inject, Output,EventEmitter} from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { MatSnackBar } from '@angular/material/snack-bar';
import { FbNavMenuService } from 'src/app/_form-builder/fb-nav-menu.service';
import { AccordionMenu, SubMenu }  from 'src/app/_interfaces/index';
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

  @Output() outPutRefreshMenu = new EventEmitter()
  @Input() accordionMenu  : AccordionMenu;
  @Input() item$          : Observable<SubMenu>;
  @Input() item           : SubMenu;
  @Input() id             : number;
  inputForm               : FormGroup;
  minimized               : boolean;
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
    if (data) {
      this.accordionID = data.accordionID;
      this.id = data.id;
      this.menugroupID = data.menuID
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
    if (this.id && this.id != 0) {
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

    if (!this.inputForm) {
      this.inputForm = this.fbNavService.initSubMenuForm(this.inputForm);
    }

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

      // console.table(this.inputForm.value);
      // return;
      // this.item.menuID = this.accordionMenu?.id;
      this.item.minimized = this.minimized
      let item$: any;

      if (!this.item.id) {
         item$ = this.menusService.putSubMenuByID(site, this.item.id, this.item)
         this.applyChanges(item$ ,'Item saved.')
      }

      if (this.item.id) {
        item$ = this.menusService.postSubMenuItem(site, this.item)
        this.applyChanges(item$, 'Item saved.')
      }

    }
  }

  deleteItem() {
    console.log('menu item accordion menu', this.id)
    const site = this.siteService.getAssignedSite()
    console.log('menu item accordion menu')
    if (this.item.id) {
      const item$ = this.menusService.deleteSubMenu(site, this.item.id)
      this.applyChanges(item$ ,'Item deleted.')
    }
  }

  applyChanges(item$: Observable<SubMenu>, successMesage: string) {
    item$.subscribe(
      {
        next: data=> {
        this._snackBar.open(successMesage, 'Success', {duration: 2000})
        this.outPutRefreshMenu.emit(true)
      },
        error : err => {
          this._snackBar.open(successMesage, 'Failure', {duration: 2000})
          console.log(err)
        }
      }
    )

  }




}
