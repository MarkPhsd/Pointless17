import { Component, OnInit, Input, EventEmitter, Output, OnChanges } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { MatSnackBar } from '@angular/material/snack-bar';
import { FbNavMenuService } from 'src/app/_form-builder/fb-nav-menu.service';
import { AccordionMenu, MenuGroup, SubMenu }  from 'src/app/_interfaces/index';
import { SitesService } from 'src/app/_services/reporting/sites.service';
import { Observable } from 'rxjs';
import { MenusService } from 'src/app/_services/system/menus.service';

@Component({
  selector: 'app-accordion-menu-item-edit',
  templateUrl: './accordion-menu-item-edit.component.html',
  styleUrls: ['./accordion-menu-item-edit.component.scss']
})
export class AccordionMenuItemEditComponent implements OnInit {//, OnChanges {

  @Input() item$          : Observable<AccordionMenu>;
  @Input() item           : AccordionMenu;
  @Input() id             : number;
  inputForm               : FormGroup;
  active                  : boolean;

  constructor(
    private fbNavService: FbNavMenuService,
    private fb: FormBuilder,
    private siteService: SitesService,
    private _snackBar: MatSnackBar,
    private menusService: MenusService,
  )
  { }

  ngOnInit() {
    this.refreshForm();
    this.refreshData();
  }

  refreshData() {
    const site = this.siteService.getAssignedSite()
    if (this.id) {
      const item$ = this.menusService.getAccordionMenuByID(site, this.id);
      item$.subscribe( data => {
        this.item = data
        this.refreshForm()
        return
      })
    }
    this.refreshForm()
  }

  refreshForm() {
    if (this.item) {
      this.inputForm = this.fbNavService.initAccordionForm(this.inputForm);
      this.inputForm.patchValue(this.item)
      this.active = this.item.active;
    }
    if (!this.item) {
      this.inputForm = this.fbNavService.initAccordionForm(this.inputForm);
      this.active = false
    }
  }

  save() {
    const site = this.siteService.getAssignedSite()
    if (this.inputForm.valid) {
      this.item = this.inputForm.value
      this.item.active = this.active
      const item$ = this.menusService.putAccordionMenuByID(site , this.item.id,  this.item)
      item$.subscribe(data=> {
          this._snackBar.open('Item saved', 'Success', {duration: 2000})
        }, err => {
          this._snackBar.open('Item not saved', 'Failure', {duration: 2000})
          console.log(err)
        }
      )
    }
  }



}

