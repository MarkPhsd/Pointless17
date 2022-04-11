import { Component, OnInit, Input, Inject, OnDestroy } from '@angular/core';
import { FormGroup } from '@angular/forms';
import { MatSnackBar } from '@angular/material/snack-bar';
import { FbNavMenuService } from 'src/app/_form-builder/fb-nav-menu.service';
import { AccordionMenu}  from 'src/app/_interfaces/index';
import { SitesService } from 'src/app/_services/reporting/sites.service';
import { Observable, Subscription } from 'rxjs';
import { MenusService } from 'src/app/_services/system/menus.service';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';

export interface data {
  id: number;
  menuGroupID: number;
}
@Component({
  selector: 'app-accordion-menu-item-edit',
  templateUrl: './accordion-menu-item-edit.component.html',
  styleUrls: ['./accordion-menu-item-edit.component.scss'],
  providers: [
    { provide: MAT_DIALOG_DATA, useValue: {} },
    { provide: MatDialogRef, useValue: {} }
  ]
})
export class AccordionMenuItemEditComponent implements OnInit, OnDestroy {//, OnChanges {

  @Input() item$          : Observable<AccordionMenu>;
  @Input() id             : number;
  @Input() item           : AccordionMenu;

  _accordionMenu: Subscription;
   accordionMenu : AccordionMenu;
  inputForm               : FormGroup;
  active                  : boolean;
  menuGroupID             : number;

  initSubscriptions() {
    this._accordionMenu = this.menusService.accordionMenu$.subscribe(data => {
      if (data) {
        this.accordionMenu = data
      }
      if (!data) {
        this.accordionMenu = null;
      }
    }
   )
  }

  ngOnDestroy(): void {
    if (this._accordionMenu ) {
      this._accordionMenu.unsubscribe()
    }
  }

  constructor(
    private fbNavService    : FbNavMenuService,
    private siteService     : SitesService,
    private _snackBar       : MatSnackBar,
    private menusService    : MenusService,
    private dialogRef       : MatDialogRef<AccordionMenuItemEditComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any
  ) {
    console.log('MAT_DIALOG_DATA', data)
    if (data) {
      this.id = data.id
      this.menuGroupID = data.menuGroupID
    }
  }

  ngOnInit() {
    this.initSubscriptions();
    if (this.accordionMenu) {
      this.item = this.accordionMenu;
    }
    this.refreshData();
  }

  refreshData() {
    const site = this.siteService.getAssignedSite()
    if (this.item) {
      this.refreshForm()
      return
    }
    if (this.id) {
      const item$ = this.menusService.getAccordionMenuByID(site, this.id);
      item$.subscribe( data => {
        this.item = data
        this.refreshForm()
        return
      })
    }
    if (!this.id || !this.item) {
      this.refreshForm()
      return
    }
  }

  refreshForm() {
    if (this.item) {
      console.log('refresh form')
      this.inputForm = this.fbNavService.initAccordionForm(this.inputForm);
      this.inputForm.patchValue(this.item)
      this.active = this.item.active;
    }
    if (!this.item) {
      this.item = {} as AccordionMenu;
      this.item.menuGroupID = this.menuGroupID;
      this.inputForm = this.fbNavService.initAccordionForm(this.inputForm);
      this.inputForm.patchValue(this.item)
      this.active = false
    }
  }

  save() {
    const site = this.siteService.getAssignedSite()
    if (this.inputForm.valid) {
      this.item = this.inputForm.value
      this.item.active = this.active
      let item$: any;
      if (this.item.id != 0) {
         item$ = this.menusService.putAccordionMenuByID(site , this.item.id,  this.item)
      }
      if (this.item.id == 0) {
         item$ = this.menusService.postAccordionMenu(site , this.item)
      }
      this.saveSub(item$)
    }
  }

  saveSub(item$: Observable<AccordionMenu>) {
    item$.subscribe(
      {
        next: data=> {
            this.item = data;
            this.menusService.updateAccordionMenuSubscription(data)
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

