import { Component, EventEmitter, Input, OnInit, Output, OnChanges } from '@angular/core';
import { UntypedFormBuilder, UntypedFormGroup } from '@angular/forms';
import { MatLegacySnackBar as MatSnackBar } from '@angular/material/legacy-snack-bar';
import { SitesService } from 'src/app/_services/reporting/sites.service';
import { IMenuButtonProperties, MBMenuButtonsService, mb_MenuButton } from 'src/app/_services/system/mb-menu-buttons.service';

@Component({
  selector: 'function-group-button-edit',
  templateUrl: './function-group-button-edit.component.html',
  styleUrls: ['./function-group-button-edit.component.scss']
})
export class FunctionGroupButtonEditComponent implements OnInit,OnChanges {
  @Output() outPutUpdateButtons = new EventEmitter();
  @Output() outSaveButton = new EventEmitter();
  @Input() menuButton   : mb_MenuButton;
  @Input() inputForm    : UntypedFormGroup;
  propForm              : UntypedFormGroup;

  functionList = []

  constructor(
    private _snackBar   : MatSnackBar,
    private siteService : SitesService,
    private fb          : UntypedFormBuilder,
    private menuService : MBMenuButtonsService) { }

  ngOnInit(): void {
    const i = 0
    if (!this.menuButton) { return }
    this.initFormFields();
    // console.log(this.menuButton)

    this.functionList = this.menuService.functions.sort((a, b) => {
      if (a.function < b.function) {
        return -1;
      } else if (a.function > b.function) {
        return 1;
      } else {
        return 0;
      }
    });
  }

  ngOnChanges(): void {
    if (!this.menuButton) { return }
    this.initFormFields();
  }

  initFormFields() {
     if (!this.menuButton) { return }
    this.inputForm = this.fb.group({
      id          : [''],
      name        : [''],
      sort        : [''],
      // properties  //: [''],
      icon        : [''],
      mB_MenuButtonGroupID: [''],
    })
    this.inputForm.patchValue(this.menuButton)

    if (!this.inputForm) { return }
    this.propForm = this.fb.group({
      orderHistory   : [''],
      method         : [''],
      balanceRemainingGreaterThanZero: [''],
      allowStaff     : [''],
      allowUser      : [''],
      itemsPrinted   : [''],
      paymentsMade   : [''],
      isAuthorized   : [''],
      suspendedOrders: [''],
      completedOrder : [''],
      completedOrderAndUser: [''],
      sidePanelOnly  : [''],
      mainPanelOnly  : [''],
      smallDeviceOnly: [''],
    })
    const prop = JSON.parse(this.menuButton.properties)
    this.propForm.patchValue(prop)
  }

  deleteItem(event) {
    const site = this.siteService.getAssignedSite();

    const result = window.confirm('Are you sure you want to delete this item?')
    if (!result) { return }
    if (!this.menuButton) {     const site = this.siteService.getAssignedSite()
      this._snackBar.open("No Product Selected", "Success")
      return
    }
    if (this.menuButton) {
      const menuButton =  this.inputForm.value as mb_MenuButton;
      this.menuService.deleteButton(site, menuButton.id).subscribe(data => {
        this.outPutUpdateButtons.emit(true)
      })
    }
  }

  save() {

    const site = this.siteService.getAssignedSite();
    if (!this.menuButton) {
      const site = this.siteService.getAssignedSite()
      this._snackBar.open("No Product Selected", "Success")
      return
    }

    if (this.menuButton) {
      const menuButton =  this.inputForm.value as mb_MenuButton;
      const item       = this.propForm.value as IMenuButtonProperties;
      const prop       = JSON.stringify(item);
      menuButton.properties = prop;
      this.menuService.putButton(site, menuButton).subscribe(data => {
        this.outPutUpdateButtons.emit(data)
      }, err => {
        this._snackBar.open(`Save failed ${err}`, "Success")
      })
    }
  }



  copyItem(event) {
    //do confirm of delete some how.
    //then
  }

}

