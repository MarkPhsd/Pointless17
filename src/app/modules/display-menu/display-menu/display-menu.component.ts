import { Component, Inject, OnInit } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';
import { IDisplayMenu } from 'src/app/_interfaces/menu/price-schedule';
import { DisplayMenuService } from 'src/app/_services/menu/display-menu.service';
import { Observable, switchMap, of, ignoreElements} from 'rxjs';
import { SitesService } from 'src/app/_services/reporting/sites.service';
import { FormBuilder, FormControl, FormGroup, Validators,} from '@angular/forms';

@Component({
  selector: 'display-menu',
  templateUrl: './display-menu.component.html',
  styleUrls: ['./display-menu.component.scss']
})
export class DisplayMenuComponent implements OnInit {

  inputForm: FormGroup;
  id: number;
  displayMenu: IDisplayMenu;
  action$: Observable<any>;
  message = ""
  performingAction =false;

  logo: string;
  backGroundImage: string;
  fileNames: any;

  constructor(private fb: FormBuilder,
              private displayMenuService: DisplayMenuService,
              private siteService: SitesService,
              private _snackBar: MatSnackBar,
              private dialogRef: MatDialogRef<DisplayMenuComponent>,
              @Inject(MAT_DIALOG_DATA) public data: any) {

                if (data) {
                  this.displayMenu = data;
                }
              }

  ngOnInit(): void {
    const i = 0;
  }


  initForm() {
    this.inputForm = this.fb.group(
      {
        id: [],
        name: [  ,[Validators.required, Validators.max(50)]],
        title: [  ,[Validators.required, Validators.max(50)]],
        subTitle: [ ],
        description: [ ],
        footer:  [ ],
        logo: [],
        backGroundImage: [],
        backcolor: [],
        backcolorOpacity: [],
      }
    )

    if (this.displayMenu) {
      this.inputForm.patchValue(this.displayMenu)
    }

    // x
  }

  setFormData() {
    const site = this.siteService.getAssignedSite()
    if (this.displayMenu){
      this.action$ = this.displayMenuService.getMenu(site,this.displayMenu.id).pipe(
          switchMap(data => {
            this.inputForm.patchValue(data)
            return of(data)
          }
        )
      )
    }
  }


  updateItem(event): Observable<IDisplayMenu> {
    const site = this.siteService.getAssignedSite()

      this.message = ""
      this.performingAction= true;
      const item$ = this.displayMenuService.save(site, this.displayMenu);
      return item$.pipe(switchMap(
          data => {
            this.displayMenu = data;
            this.notifyEvent('Item Updated', 'Success')
            // this.message = 'Saved'
            this.logo = data.logo;
            this.backGroundImage = data.backGroundImage
            this.performingAction = false;
            return of(data)
          }
      ))

  };

  // clearMessage() {
  //   setTimeout( )
  // }

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
