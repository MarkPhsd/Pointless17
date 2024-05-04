import { Component, Inject, OnInit } from '@angular/core';
import { UntypedFormBuilder, UntypedFormGroup } from '@angular/forms';
import { MatLegacyDialogRef as MatDialogRef, MAT_LEGACY_DIALOG_DATA as MAT_DIALOG_DATA} from '@angular/material/legacy-dialog';
import { PriceScheduleMenuGroupService } from 'src/app/_services/menu/price-schedule-menu-group.service';
import { SitesService } from 'src/app/_services/reporting/sites.service';
import { PriceMenuGroup, PriceMenuGroupItem, PSMenuGroupPaged, PSSearchModel, PS_SearchResultsPaged } from 'src/app/_interfaces/menu/price-schedule';

@Component({
  selector: 'app-psmenu-group-edit',
  templateUrl: './psmenu-group-edit.component.html',
  styleUrls: ['./psmenu-group-edit.component.scss']
})
export class PSMenuGroupEditComponent implements OnInit {

  priceMenuGroup: PriceMenuGroup;
  inputForm     : UntypedFormGroup;
  description   : string;

  constructor(
    private priceScheduleMenuGroupService: PriceScheduleMenuGroupService,
    private fb                      : UntypedFormBuilder,
    private siteService             : SitesService,
    private dialogRef: MatDialogRef<PSMenuGroupEditComponent>,
    @Inject(MAT_DIALOG_DATA) public data: number,
  )
  {
      this.initalizeWindow(data)
  }

  initalizeWindow(id: any) {
    if (id) {
      const site = this.siteService.getAssignedSite();
      this.priceScheduleMenuGroupService.getGroup(site, id).subscribe(item => {
        this.priceMenuGroup = item;
        // this.description = item.description;
        const form =  this.initForm()
        if (form) {
          form.patchValue(item)
        }
      })
    }
  }

  ngOnInit(): void {
    console.log('')
  }

  initForm(): UntypedFormGroup {
    this.inputForm = this.fb.group( {
      id      :    [],
      name:        [],
      description: [],
      sort:        [],
      image:       [],
    } );
    return this.inputForm
  }

  received_URLMainImage(event) {
    this.inputForm.patchValue({image: event})
  }

 updateCategory(event, cancel: boolean){
   const site = this.siteService.getAssignedSite();
     let item = this.inputForm.value as PriceMenuGroup
     this.priceScheduleMenuGroupService.save(site, item).subscribe(data => {
        if (cancel) {
          this.onCancel(null);
        }
     })
  }


 updateCategoryExit(event){

 }

 deleteCategory(event){

  // const result = window.confirm('Are you sure you want to delete this item?')
  // if (!result) { return }
  // console.log('delete group')
  // return
  const site = this.siteService.getAssignedSite();
  if (this.inputForm.valid) {
    this.priceScheduleMenuGroupService.delete(site, this.priceMenuGroup.id).subscribe(data => {
       this.onCancel(null);
    })
  }
 }

 onCancel(event){
  this.dialogRef.close();
 }



}
