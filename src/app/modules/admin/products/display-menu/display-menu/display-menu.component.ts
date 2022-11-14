import { Component, Inject, OnInit } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';
import { IDisplayMenu } from 'src/app/_interfaces/menu/price-schedule';
import { DisplayMenuService } from 'src/app/_services/menu/display-menu.service';
import { Observable, switchMap, of, ignoreElements} from 'rxjs';
import { SitesService } from 'src/app/_services/reporting/sites.service';
import { FormBuilder, FormControl, FormGroup, Validators,} from '@angular/forms';
import { IListBoxItemB } from 'src/app/_interfaces/dual-lists';

@Component({
  selector: 'Admin-display-menu',
  templateUrl: './display-menu.component.html',
  styleUrls: ['./display-menu.component.scss']
})
export class AdminDisplayMenuComponent  {

  inputForm: FormGroup;
  id: number;
  displayMenu: IDisplayMenu;
  action$: Observable<any>;
  message = ""
  performingAction =false;
  menuList = [] as IListBoxItemB[];
  logo: string;
  backGroundImage: string;
  fileNames: any;
  description;

  constructor(private fb: FormBuilder,
              private displayMenuService: DisplayMenuService,
              private siteService: SitesService,
              private _snackBar: MatSnackBar,
              private dialogRef: MatDialogRef<AdminDisplayMenuComponent>,
              @Inject(MAT_DIALOG_DATA) public data: any) {

    const site = siteService.getAssignedSite();
    this.action$ = this.displayMenuService.getMenu(site, data.id).pipe(
      switchMap(data => {
        this.displayMenu = data;
        this.initForm(data)
        return of(data)
      })
    )

  }

  initForm(data) {
    this.inputForm = this.fb.group(
      {
        id : [],
        name: [  ,[Validators.required, Validators.max(50)]],
        title: [  ,[Validators.required, Validators.max(50)]],
        subTitle: [],
        description: [],
        footer: [],
        backcolor: [],
        backcolorOpacity: [],
        menuSections: [],
        template: [],
        css: [],
        logo: [],
        backGroundImage: [],
      }
    )

    this.displayMenu = data as IDisplayMenu;
    this.inputForm.patchValue(data);
    this.description = data?.description;
    this.setMenuSelections(data);
  }

  setMenuSelections(data) {
    if (data.menuSections) {
      this.menuList = JSON.parse(data.menuSections);
    }
  }

  // setFormData() {
  //   const site = this.siteService.getAssignedSite()
  //   if (this.displayMenu){
  //     this.action$ = this.displayMenuService.getMenu(site,this.displayMenu.id).pipe(
  //         switchMap(data => {
  //           this.inputForm.patchValue(data);
  //           this.setMenuSelections(data)
  //           return of(data);
  //         }
  //       )
  //     )
  //   }
  // }

  outPutList(event) {
    const item = event;
    const value = JSON.stringify(item);
    this.inputForm.patchValue({menuSections: value})
    this.menuList = event
  }

  updateItem(event): Observable<IDisplayMenu> {
      const site = this.siteService.getAssignedSite()

      this.message = ""
      this.performingAction= true;
      if (!this.inputForm.valid) {
        this.notifyEvent('Something is wrong with the form. Please confirm', 'Alert')
        return;
      }


      this.displayMenu = this.inputForm.value as IDisplayMenu;
      this.displayMenu.description = this.description;

      const item$ = this.displayMenuService.save(site, this.displayMenu);
      return item$.pipe(switchMap(
          data => {
            this.displayMenu = data;
            this.notifyEvent('Item Updated', 'Success');
            this.logo = data.logo;
            this.backGroundImage = data.backGroundImage;
            this.performingAction = false;
            return of(data);
          }
      ))

  };

  copyItem(event)  {

  }

  updateSave(event) {
    this.action$ = this.updateItem(event);
  }

  updateItemExit(event) {
    this.action$ = this.updateItem(event).pipe(switchMap ( data => {
      this.performingAction = false;
      this.onCancel(event);
      return of(data);
    }));
  };


  setLogo(event) {
    this.inputForm.patchValue({logo: event})
  }

  setBackgroundImage(event) {
    this.inputForm.patchValue({backgroundImage: event})
  }

  onCancel(event) {
    this.dialogRef.close();
  }


  deleteItem(event) {

    // const result = window.confirm('Are you sure you want to delete this item?')
    // if (!result) { return }

    const site = this.siteService.getAssignedSite()
    if (!this.displayMenu) {
      this._snackBar.open("No Product Selected", "Success")
       return
    }

    this.displayMenuService.delete(site, this.displayMenu.id).subscribe( data =>{
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
