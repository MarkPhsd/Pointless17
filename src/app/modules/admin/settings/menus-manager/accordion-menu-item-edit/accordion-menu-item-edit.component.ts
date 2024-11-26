import { Component, OnInit, Input, Inject, OnDestroy, EventEmitter, Output } from '@angular/core';
import { FormsModule, ReactiveFormsModule, UntypedFormGroup } from '@angular/forms';
import { MatLegacySnackBar as MatSnackBar } from '@angular/material/legacy-snack-bar';
import { FbNavMenuService } from 'src/app/_form-builder/fb-nav-menu.service';
import { AccordionMenu}  from 'src/app/_interfaces/index';
import { SitesService } from 'src/app/_services/reporting/sites.service';
import { Observable, Subscription } from 'rxjs';
import { MenusService } from 'src/app/_services/system/menus.service';
import { MatLegacyDialogRef as MatDialogRef, MAT_LEGACY_DIALOG_DATA as MAT_DIALOG_DATA} from '@angular/material/legacy-dialog';
import { CommonModule } from '@angular/common';
import { AppMaterialModule } from 'src/app/app-material.module';
import { SharedPipesModule } from 'src/app/shared-pipes/shared-pipes.module';

export interface data {
  id: number;
  menuGroupID: number;
}
@Component({
  selector: 'app-accordion-menu-item-edit',
  standalone: true,
  imports: [CommonModule,AppMaterialModule,FormsModule,ReactiveFormsModule,

  SharedPipesModule],
  templateUrl: './accordion-menu-item-edit.component.html',
  styleUrls: ['./accordion-menu-item-edit.component.scss'],
  providers: [
    { provide: MAT_DIALOG_DATA, useValue: {} },
    { provide: MatDialogRef, useValue: {} }
  ]
})
export class AccordionMenuItemEditComponent implements OnInit, OnDestroy {//, OnChanges {
  @Output() outPutRefreshMenu = new EventEmitter()
  @Input() item$          : Observable<AccordionMenu>;
  @Input() id             : number;
  @Input() item           : AccordionMenu;

  _accordionMenu          : Subscription;
   accordionMenu          : AccordionMenu;
  inputForm               : UntypedFormGroup;
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
    if (this.item) {
      this.accordionMenu = this.item
    }
    this.refreshData();
  }

  ngOnDestroy(): void {
    if (this._accordionMenu ) {
      this._accordionMenu.unsubscribe()
    }
  }

  refreshData() {
    const site = this.siteService.getAssignedSite()
    if (this.item) {
      this.refreshForm()
      return
    }
    if (this.id) {
      console.log('get accordion data, refreshdata')
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
      this.saveSub(item$, 'Item Saved')
    }
  }

  saveSub(item$: Observable<AccordionMenu>, saveMessage: string) {
    item$.subscribe(
      {
        next: data=> {
            this.item = data;
            this.menusService.updateAccordionMenuSubscription(data)
            this._snackBar.open(saveMessage, 'Success', {duration: 2000})
            this.outPutRefreshMenu.emit(true)
        },
        error : err => {
          this._snackBar.open('Item not changed', 'Failure', {duration: 2000})
          console.log(err)
        }
      }
    )
  }

  deleteItem() {
    console.log('menu item accordion menu')
    const site = this.siteService.getAssignedSite()
    let item$: any;
    if (this.item.id) {
      item$ = this.menusService.deleteAccordionMenu(site , this.item.id)
      this.saveSub(item$, 'Item deleted')
    }
  }


}

