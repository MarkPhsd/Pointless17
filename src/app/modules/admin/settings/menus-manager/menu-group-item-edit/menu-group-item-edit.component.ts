import { Component, OnInit, Input, OnChanges } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { MatSnackBar } from '@angular/material/snack-bar';
import { FbNavMenuService } from 'src/app/_form-builder/fb-nav-menu.service';
import { SubMenu }  from 'src/app/_interfaces/index';
import { SitesService } from 'src/app/_services/reporting/sites.service';
import { Observable } from 'rxjs';
import { MenusService } from 'src/app/_services/system/menus.service';

@Component({
  selector: 'app-menu-group-item-edit',
  templateUrl: './menu-group-item-edit.component.html',
  styleUrls: ['./menu-group-item-edit.component.scss']
})
export class MenuGroupItemEditComponent implements OnInit, OnChanges {

  @Input() item$          : Observable<SubMenu>;
  @Input() item           : SubMenu;
  @Input() id             : number;
  inputForm               : FormGroup;
  minimized                  : boolean;

  constructor(
    private fbNavService: FbNavMenuService,
    private fb: FormBuilder,
    private siteService: SitesService,
    private _snackBar: MatSnackBar,
    private menusService: MenusService,
  )
  {}

  ngOnInit() {
    this.refreshData();
    this.refreshForm();
  }
  ngOnChanges(): void {
    //Called before any other lifecycle hook. Use it to inject dependencies, but avoid any serious work here.
    //Add '${implements OnChanges}' to the class.
    this.refreshForm();

  }
  refreshData() {
    const site = this.siteService.getAssignedSite();
    if (this.id) {
      console.log('refresh data', this.id)
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
    if (this.item) {
      this.inputForm = this.fbNavService.initSubMenuForm(this.inputForm);
      console.log(this.item)
      this.inputForm.patchValue(this.item)
      this.minimized = this.item.minimized;
    }
    if (!this.item) {
      this.inputForm = this.fbNavService.initSubMenuForm(this.inputForm);
      this.minimized = false
    }
  }

  save() {
    const site = this.siteService.getAssignedSite()
    if (this.inputForm.valid) {
      this.item = this.inputForm.value
      this.item.minimized = this.minimized
      const item$ = this.menusService.putSubMenuByID(site , this.item.id,  this.item)
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
