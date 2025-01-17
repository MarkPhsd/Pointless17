import { CommonModule } from '@angular/common';
import { Component, Inject, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MatLegacyDialogRef as MatDialogRef, MAT_LEGACY_DIALOG_DATA as MAT_DIALOG_DATA} from '@angular/material/legacy-dialog';
import { ActivatedRoute, Router } from '@angular/router';
import { Observable, Subscription, catchError, of, switchMap } from 'rxjs';
import { ProductEditButtonService } from 'src/app/_services/menu/product-edit-button.service';
import { PartBuilderMainMethodsService } from 'src/app/_services/partbuilder/part-builder-main-methods.service';
import { PB_Main, PartBuilderMainService } from 'src/app/_services/partbuilder/part-builder-main.service';
import { SitesService } from 'src/app/_services/reporting/sites.service';
import { AppMaterialModule } from 'src/app/app-material.module';
import { SharedPipesModule } from 'src/app/shared-pipes/shared-pipes.module';
import { PartBuilderComponentEditComponent } from '../part-builder-component-edit/part-builder-component-edit.component';
import { ValueFieldsComponent } from '../../productedit/_product-edit-parts/value-fields/value-fields.component';
import { EditButtonsStandardComponent } from 'src/app/shared/widgets/edit-buttons-standard/edit-buttons-standard.component';
import { PartBuilderTreeComponent } from '../part-builder-tree/part-builder-tree.component';

@Component({
  selector: 'app-part-builder-edit',
  standalone: true,
  imports: [CommonModule,AppMaterialModule,FormsModule,ReactiveFormsModule,
    PartBuilderComponentEditComponent,ValueFieldsComponent,
    EditButtonsStandardComponent,PartBuilderTreeComponent,
  SharedPipesModule],
  templateUrl: './part-builder-edit.component.html',
  styleUrls: ['./part-builder-edit.component.scss']
})
export class PartBuilderEditComponent implements OnInit {

  value = {price: 0, cost: 0};
  itemChanged: boolean;
  action$   : Observable<PB_Main>;
  pb_Main  : PB_Main;
  pb_Main$ : Observable<PB_Main>;
  inputForm: FormGroup;
  _pb_Main : Subscription;
  loopDetected: boolean;
  site = this.siteService.getAssignedSite()
  id: number;

  initPBMainSubscription() {
   this._pb_Main = this.partBuilderMainMethods.PB_Main$.subscribe(data => {
      this.pb_Main = data;
   })
  }

  constructor(private siteService: SitesService,
              private fb: FormBuilder,
              public  route: ActivatedRoute,
              private router: Router,
              private partBuilderMainMethods: PartBuilderMainMethodsService,
              private partBuilderMainService: PartBuilderMainService,
              private productEditButtonService: ProductEditButtonService,
              private dialogRef: MatDialogRef<PartBuilderEditComponent>,
              @Inject(MAT_DIALOG_DATA) public data: any) {

    this.initForm()

    if (data && data.id) {
      this.initFormData(data)
      this.partBuilderMainMethods.updatePBMain(data)
    } else {
      this.id = +this.route.snapshot.paramMap.get('id');
      if (this.id) {
        this.refreshForm(this.id)
      }
    }
    this.initPBMainSubscription();
  }

  refreshForm(event) {
    if (!this.id) { return }
    this.pb_Main$ = this._refreshForm()
  }

  childAddItem(){
    this.productEditButtonService.openNewItemSelector()
  }

  _refreshForm() {
    const site = this.siteService.getAssignedSite()
    let pb_main = {} as PB_Main;
    return this.partBuilderMainService.getItem(this.site, +this.id).pipe(switchMap(data => {
      this.setData(data)
        pb_main = data;
        this.value = this.calcPriceCost(data)
        return this.partBuilderMainService.detectInfiniteLoop(site, data);
      }
    )).pipe(switchMap(data => {
      this.loopDetected = data;
      return of(pb_main)
    }))
  }

  calcPriceCost(item: PB_Main) {

    let value = {price: 0, cost: 0};

    item.pB_Components.forEach(data => {
      value = this.getCostPrice(data, value)

      // console.log(value)
      if (data.pb_MainID_Associations && data.pb_MainID_Associations.length > 0) {

        data.pb_MainID_Associations.forEach(data => {
          if (data.pB_Components && data.pB_Components.length>0) {

            data.pB_Components.forEach(itemValue => {

              value = this.getCostPrice(itemValue, value)
              // console.log(value)

            })
          }
        })
      }
    })

    return value;
  }

  getCostPrice(data,item) {
    if (data.quantity) {
      if (data.price) {
        item.price += (data.price * data.quantity);
      }
      if (data.cost) {
        item.cost += (data.cost * data.quantity);
      }
    }
    return item;
  }


  setData(data) {
    this.pb_Main = data;
    this.id = data.id;
    this.initFormData(data)
    this.partBuilderMainMethods.updatePBMain(data)
    this.itemChanged = true;
  }

  ngOnInit(): void {
    const i = 0;
  }

  initFormData(data: PB_Main) {
    if (this.inputForm) {
      this.inputForm.patchValue(data)
    }
  }

  initForm() {
    this.inputForm = this.fb.group({
      id: [''],
      name: [''],
      sort: [''],
      dateUpdated: ['']
    });
  }

  updateSave(event) {
    this.save(false)
  }

  saveUpdate(event) {
    this.updateSave(event)
  }
  updateItemExit(event ){
    this.save(true)
  }

  save(close) {
    const site = this.siteService.getAssignedSite()
    if (!this.pb_Main) { return }
    if (this.pb_Main) {
      this.pb_Main.name = this.inputForm.controls['name'].value;
      if (this.id) {
        this.pb_Main.id = this.id;
      }
      this.action$ = this.partBuilderMainService.save(site, this.pb_Main).pipe(
        switchMap(data => {
          return this._refreshForm()
      }), catchError(data => {
        this.siteService.notify('Error' + data.toString, 'close', 1000, 'red')
        return of(data)
      }))
    }
  }

  deleteItem(event) {
    const site = this.siteService.getAssignedSite()
    const confirm = window.confirm('Are you sure you want to delete this item?')
    if (!this.pb_Main) { return }
    if (!confirm) {return}
    this.action$ = this.partBuilderMainService.delete(site, this.pb_Main.id).pipe(
      switchMap(data => {
        this.itemChanged = true;
        this.siteService.notify('Saved', 'close', 1000, 'green')
        return of(data)
      }), catchError(data => {
        this.siteService.notify('Error' + data.toString, 'close', 1000, 'red')
        return of(data)
    }))
  }

  onCancel(event) {
    let result = false
    // console.log('on cancel')
    this.router.navigate(['part-builder-list'])
    if (this.itemChanged) {result = true}
  }

  copyItem(event) {

  }

}

