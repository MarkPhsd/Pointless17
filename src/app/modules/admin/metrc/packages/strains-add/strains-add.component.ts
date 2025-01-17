import { Component,  Inject,   Input,   OnDestroy,   OnInit,} from '@angular/core';
import { ActivatedRoute,  } from '@angular/router';
import { UntypedFormBuilder, UntypedFormGroup, Validators, UntypedFormControl, FormsModule, ReactiveFormsModule} from '@angular/forms';
import { MatLegacySnackBar as MatSnackBar } from '@angular/material/legacy-snack-bar';
import { AWSBucketService, AuthenticationService, IItemBasic, MenuService,  } from 'src/app/_services';
import { ISite } from 'src/app/_interfaces/site';
import { MatLegacyDialogRef as MatDialogRef, MAT_LEGACY_DIALOG_DATA as MAT_DIALOG_DATA} from '@angular/material/legacy-dialog';
import { Observable, of, Subscription, switchMap } from 'rxjs';
import { IItemFacilitiyBasic } from 'src/app/_services/metrc/metrc-facilities.service';
import { InventoryAssignmentService} from 'src/app/_services/inventory/inventory-assignment.service';
import { MetrcPackagesService } from 'src/app/_services/metrc/metrc-packages.service';
import { METRCPackage } from 'src/app/_interfaces/metrcs/packages';
import { SitesService } from 'src/app/_services/reporting/sites.service';
import { ConversionsService, IUnitConversion } from 'src/app/_services/measurement/conversions.service';
import { ProductSearchModel } from 'src/app/_interfaces/search-models/product-search';
import { IProduct, UserPreferences } from 'src/app/_interfaces';
import { LabTestResult, LabTestResultResponse, MetrcLabTestsService } from 'src/app/_services/metrc/metrc-lab-tests.service';
import { ItemTypeService } from 'src/app/_services/menu/item-type.service';
import { CommonModule } from '@angular/common';
import { AppMaterialModule } from 'src/app/app-material.module';
import { SharedPipesModule } from 'src/app/shared-pipes/shared-pipes.module';
import { MetrcIntakeHeaderComponent } from '../metrc-inventory-properties/metrc-intake-header/metrc-intake-header.component';
import { ActivityTogglesMetrcComponent } from '../metrc-inventory-properties/activity-toggles-metrc/activity-toggles-metrc.component';
import { EditButtonsStandardComponent } from 'src/app/shared/widgets/edit-buttons-standard/edit-buttons-standard.component';
import { MetrcInventoryPropertiesComponent } from '../metrc-inventory-properties/metrc-inventory-properties.component';
import { PriceCategorySelectComponent } from '../../../products/productedit/_product-edit-parts/price-category-select/price-category-select.component';
import { ChemicalValuesComponent } from '../../../products/productedit/_product-edit-parts/chemical-values/chemical-values.component';
import { StrainPackagesComponent } from './strain-packages/strain-packages.component';
import { MetrcRequirementsComponent } from '../metrc-requirements/metrc-requirements.component';
import { NgxJsonViewerModule } from 'ngx-json-viewer';

@Component({
  selector: 'app-strains-add',
  standalone: true,
  imports: [CommonModule,AppMaterialModule,FormsModule,ReactiveFormsModule,
    MetrcIntakeHeaderComponent,
    ActivityTogglesMetrcComponent,
    EditButtonsStandardComponent,
    MetrcInventoryPropertiesComponent,
    PriceCategorySelectComponent,
    ChemicalValuesComponent,
    StrainPackagesComponent,
    MetrcRequirementsComponent,
    NgxJsonViewerModule,
  SharedPipesModule],
  templateUrl: './strains-add.component.html',
  styleUrls: ['./strains-add.component.scss']
})

export class StrainsAddComponent implements OnInit, OnDestroy {

  _menuItemUpdate : Subscription;

  productionBatchNumber:  string;
  facilityLicenseNumber:  string;
  action$: Observable<any>;
  saved: boolean;

  get f():                UntypedFormGroup  { return this.packageForm as UntypedFormGroup};
  get hasImportedControl(){ return this.packageForm.get("hasImported") as UntypedFormControl;}
  get activeControl()     { return this.packageForm.get("active") as UntypedFormControl;}

  priceForm     :         UntypedFormGroup;
  packageForm:            UntypedFormGroup;
  bucketName:             string;
  awsBucketURL:           string;

  locationFormArray:      UntypedFormGroup;
  id:                     any;
  package:                METRCPackage
  package$:               Observable<METRCPackage>;
  packageForm$: Observable<any>;
  facility = {} as        IItemFacilitiyBasic
  site:                   ISite;
  menuItem:               any ;
  showJSONData: boolean; //togggles the form and viewing raw data.
  //remove
  intakeConversion         = {}  as IUnitConversion;
  intakeconversionQuantity : number;  // this.intakeConversion.value * this.package.quantity
  baseUnitsRemaining       : number; //= this.intakeconversionQuantity
  initialQuantity          : number; // this.intakeconversionQuantity

  filter : ProductSearchModel;

  constructor(
          private conversionService: ConversionsService,
          public route: ActivatedRoute,
          public fb: UntypedFormBuilder,
          private awsBucket: AWSBucketService,
          private _snackBar: MatSnackBar,
          private siteService: SitesService,
          private menuService: MenuService,
          private authenticationService: AuthenticationService,
          private metrcPackagesService: MetrcPackagesService,
          private itemTypeService: ItemTypeService,
          private metrcLabService: MetrcLabTestsService,

          private dialogRef: MatDialogRef<StrainsAddComponent>,
          @Inject(MAT_DIALOG_DATA) public data: any,
          private inventoryAssignmentService: InventoryAssignmentService,
          )
  {
    if (data) {
      this.id = data.id
    } else {
      this.id = this.route.snapshot.paramMap.get('id');
    }
  }

  async ngOnInit() {
    this.initProductSearchModel();
    const site        = this.siteService.getAssignedSite();
    this.site         = this.siteService.getAssignedSite();
    const item$       = this.metrcPackagesService.getPackagesByID(this.id, site) //.pipe().toPromise();
    this.bucketName   =  await this.awsBucket.awsBucket();
    this.awsBucketURL =  await this.awsBucket.awsBucketURL();
    this.initFields();

    this.packageForm$ = item$.pipe(switchMap(data => {
          this.package = data;
          if (this.package) {
            if (this.package?.productID) {
              this.assignMenItem(+this.package?.productID)

            }
          }
          if (!data.labResults || data.labResults == null ||
            data.labResults == 'null' || data.labResults == undefined) {
            return this.metrcLabService.getTest(site, data?.id)
          }
          return of(data)
        }
      )).pipe(switchMap(data => {
        if (!data.harvestResults || data.harvestResults == null ||
          data.harvestResults == 'null' || data.harvestResults == undefined) {
          return this.metrcLabService.getHarvest(site, data?.id)
        }
        return of(data)
      }
      )).pipe(switchMap(data => {
        this.initItemFormData(data)
        this.initPriceForm();
        return of(data)
      }
    ))

    this._menuItemUpdate = this.menuService.menuItemUpdate$.subscribe(data => {
      if (data) {
        this.menuItem = data;
      }
    })

  }


  ngOnDestroy() {
    if (this._menuItemUpdate) {
      this._menuItemUpdate.unsubscribe()
    }
  }


  setLabResultsInPackage( labResults: string) {
    let checked : boolean;
    const form = this.packageForm;

    if (!labResults) { return };
    const results: LabTestResultResponse = JSON.parse(labResults);
    const chem = {tch: 0, thc2:0, tcha:0,tcha2:0, cbd:0,cbd2:0,cbn:0,cbn2:0,cbda:0,cbda2:0};
    form.patchValue(chem)

    if (results) {
        const list = results.data as  LabTestResult[];
        const cbd = list.find(c => c.testTypeName.includes("Total CBD (mg/g;"));
        let labChecked : boolean
        // /
        try {
          if (list) {
            if (list.length>0) {
              let lab = list[0]
              form.patchValue({labFacilityLicenseNumber: lab?.labFacilityLicenseNumber,
                               labFacilityName: lab.labFacilityName});
            }
          }
        } catch (error) {
          console.log(error)
        }

        try {
          const thcLevel = list.find(c => c.testTypeName.includes("Total THC (mg/g)"));
          if (thcLevel) {
            form.patchValue({thc: thcLevel?.testResultLevel });
            form.patchValue({labFacilityLicenseNumber: thcLevel?.labFacilityLicenseNumber,
                             labFacilityName: thcLevel.labFacilityName});

            labChecked = true
            checked = true
          }
        } catch (error) {
          console.log(error)
        }

        try {
            const thca = list.find(c => c.testTypeName.includes("Delta 9"));
            if (thca) {
              form.patchValue({thca: thca?.testResultLevel });
              checked = true
            }
        } catch (error) {
          console.log(error)
        }

        try {
          const cbd = list.find(c => c.testTypeName.includes("Total CBD (mg/g;"));
          if (cbd) {
            form.patchValue({cbd: cbd?.testResultLevel });
            checked = true
          }
        } catch (error) {
          console.log(error)
        }
    }
  }

  get jsonData() {
    if (this.package) {
      if (this.package.json) {
        return JSON.parse(this.package?.json)
      }
    }
  }

  get userPref() {
    if (this.authenticationService._user.value) {
      const user = this.authenticationService._user.value;
      if (user) {
        const pref = this.authenticationService._user.value.preferences;
        const preferences = JSON.parse(pref) as UserPreferences;
        return preferences;
      }
    }
    return {} as UserPreferences;
  }

  initProductSearchModel() {
    const model = {} as ProductSearchModel;
    const list  = []
    list.push(30)
    list.push(36)
    list.push(37)
    list.push(38)
    list.push(44)
    list.push(45)
    this.filter = model;
    this.filter.itemTypeIDList = list;
  }

  updateItem(event) {
    this.update(false)
  }

  updateItemExit(event) {
    this.update(true)
  }

  update(event) {
    if (!this.package) {
      this.notifyEvent('Item not saved, package is null.', 'Failure')
      return
    }
    let metrcPackage = this.packageForm.value as METRCPackage;
    const site = this.siteService.getAssignedSite();

    if (this.hasImportedControl) {
      if (this.hasImportedControl.value)  {   metrcPackage.inventoryImported = true  }
      if (!this.hasImportedControl.value) {   metrcPackage.inventoryImported = false  }
    }
    if (this.activeControl) {
      if (this.activeControl.value) {   metrcPackage.active = true  }
      if (!this.activeControl.value) {  metrcPackage.active = false  }
    }

    // console.log('metrcPackage', metrcPackage)
    // return

    const package$       = this.metrcPackagesService.putPackage(site, this.id, metrcPackage)
    package$.subscribe( data => {
      this.notifyEvent('Item saved', 'Success')
      if (event) { this.onCancel(null) }
    })

    this.saved = true
    this.packageForm.valueChanges.subscribe(data => {
      this.assignMenItem(this.menuItem?.id)
      this.saved = false;
    })
  }

  deleteItem(event) {
    // const alert    = window.confirm('Are you sure you want to delete this item? It will re-import when you download again.')
    // if (!alert) {return}
    const site     = this.siteService.getAssignedSite();
    const package$ = this.metrcPackagesService.deletePackage(site,this.id)
    package$.subscribe( data => {
      this.notifyEvent('Item deleted', 'Success')
      this.onCancel(null)
    })
  }

  closePackage(event) {
    if (event) {
      const data = { completed: true}
      this.dialogRef.close(data)
    }
  }

  onCancel(event) {  this.dialogRef.close()  }

  getVendor(event) {
    const facility = event
    if (facility) {
      this.facilityLicenseNumber = `${facility?.displayName} - ${facility?.metrcLicense}`
      this.facility = event;
      this.packageForm.patchValue({ facilityLicenseNumber: [this.facilityLicenseNumber],})
    }
  }

  getCatalogItem(event) {
    const itemStrain = event
    if (itemStrain) {
      if (itemStrain.id) {
        const id = itemStrain.id
        this.assignMenItem(id)
      }
    }
  }

  assignMenItem(id: number) {
    console.log('assignMenItem id', id)
    if (id == 0) { return}

    this.menuService.getMenuItemByID(this.site, id).pipe(switchMap(data => {
        console.log('menu item', data?.name)
        if (data) {
          this.menuItem = data
          const item = {productName: data.name, productID: data.id}
          this.packageForm.patchValue(item)

          console.log('menu item Item Type',this.menuItem.itemType)

          if (!this.menuItem.itemType) {
            console.log("setItemType")
            return this.setItemType(this.package?.productCategoryName)
          }

          if (!this.menuItem.departmentID || this.menuItem.departmentID == 0) {
            console.log('departmentID', this.menuItem.departmentID)
            return this.setItemDepartment(this.package?.productCategoryName)
          }

          this.package.productID = null;
          this.package.productName = null;
          this.setProductNameEmpty(this.packageForm)
          return of(data)
        }
        return of(data)
      }
    )).subscribe(data => {

      if (data) {
        this.packageForm.patchValue({productName: this.menuItem.name, productID: this.menuItem.id})
        // this.setProductNameEmpty(this.packageForm)
      }
      this.menuItem = data;
      console.log(data)
    })
  }

  setItemType(productCategoryName: string) {
    return this.itemTypeService.getItemTypeByName(this.site, productCategoryName).pipe(switchMap(data => {
      console.log('setItemType', data)
      if (!data) {
        const prod = {} as IProduct;
        return of(prod)
      }
      this.menuItem.prodModifierType = data.id;
      const site = this.siteService.getAssignedSite()
      return this.menuService.getItemsNameBySearch(site, productCategoryName, 6)
    })).pipe(switchMap(dept => {
      console.log('depts', dept)
      if (dept && dept[0]) {
        this.menuItem.departmentID = dept[0]?.id;
      }

      return this.menuService.getProduct(this.site, this.menuItem.id)
    })).pipe(switchMap(data => {
      if (!data || !data?.id) {
        return of(null)
      }
      data.departmentID =  this.menuItem.departmentID
      data.prodModifierType = this.menuItem.prodModifierType
      return this.menuService.putProduct(this.site, this.menuItem.id, data)
    })).pipe(switchMap(data => {
      return of(this.menuItem)
    }))
  }

  setItemDepartment(productCategoryName: string) {

    console.log("setItemDepartment", productCategoryName)
    const site = this.siteService.getAssignedSite()
    let catID: number = 0;

    return this.menuService.getItemsNameBySearch(site, productCategoryName, 6).pipe(switchMap(dept => {
      if (dept && dept[0]) {
        this.menuItem.departmentID = dept[0]?.id;
        catID = dept[0].id;
      }
      return this.menuService.getProduct(this.site, this.menuItem.id)
    })).pipe(switchMap(data => {
      this.menuItem.departmentID = catID;
      data.departmentID = catID;
      return this.menuService.putProduct(this.site, this.menuItem.id, data)
    }
    ))
  }

  setProductNameEmpty(inputForm: UntypedFormGroup) {
    const item = {productName: '', productID: 0}
    inputForm.patchValue(item)
  }

  initPriceForm(){
    this.priceForm = this.fb.group({
      cost           : [0],
      price          : [0],
      priceCategoryID: [0],
    })
  }

  initForm() {
    if (  this.packageForm ) {
      const  site = this.siteService.getAssignedSite();
      if (this.id) {
        this.package$ = this.metrcPackagesService.getPackagesByID(this.id, site)
        this.package$.subscribe(data =>
          { this.initItemFormData(data)  }
        )
      }
    }
  }


  initItemFormData(data: METRCPackage) {
    if (data) {
      try {
        this.package = data
        this.package.labTestingState =          this.package.labTestingState.match(/[A-Z][a-z]+|[0-9]+/g).join(" ")
        this.facility = {} as                   IItemFacilitiyBasic;
        if (this.package.unitOfMeasureName) {
          this.intakeConversion = this.conversionService.getConversionItemByName(this.package.unitOfMeasureName);
          if (!this.intakeConversion.value) {this.intakeConversion.value = 1};
          if (this.intakeConversion) {
            this.intakeconversionQuantity = this.intakeConversion.value * this.package.quantity;
          } else {
            this.notifyEvent('Intake conversion not initialized', 'Alert');
          }
          this.baseUnitsRemaining = this.intakeconversionQuantity;
          this.initialQuantity    = this.intakeconversionQuantity;
        }

        this.packageForm.patchValue(data);
        this.setProductNameEmpty(this.packageForm);

        let active = true;
        if (!this.package.active)  { active = false };

        // this can use to assign the item to the form.
        // const facility = `${data?.itemFromFacilityLicenseNumber}-${data?.itemFromFacilityName}`
        // facilityLicenseNumber:            facility,

        this.packageForm.patchValue({
            productCategoryName:              data?.item?.productCategoryName,
            productCategoryType:              data?.item?.productCategoryType,
            quantityType:                     data?.item?.quantityType,
            inputQuantity:                    0,
            inventoryLocationID:              0,
            priceCategoryID                :  0,
            cost:                             0,
            price:                            0,
            jointWeight:                      1,
            active                          : active,
            sellByDate                      : data?.sellByDate,

            labTestingPerformedDate         : data?.labTestingStateDate,
            packagedDate                    : data?.packagedDate,
            expirationDate                  : data?.expirationDate,

            useByDate                       : data?.useByDate,
            productionBatchNumber           : data?.productionBatchNumber,

            productName                     : data?.productName,
            productID                       : data?.productID,

            itemFromFacilityNumber           : data?.itemFromFacilityLicenseNumber,
            itemFromFacilityName             : data?.itemFromFacilityName,
            receivedFromFacilityLicenseNumber: data?.receivedFromFacilityLicenseNumber,
            receivedFromFacilityName         : data?.receivedFromFacilityName,
            sourceHarvestNumber              : data?.sourceProductionBatchNumbers,
            sourceHarvestName                : data?.sourceHarvestName,
        })
        // console.log(this.packageForm.value)
        this.setLabResultsInPackage(this.package?.labResults)
      } catch (error) {
        console.log(error)
      }
    }
  }

  getNewPackage(metrcPackage: METRCPackage) {
    this.initItemFormData(metrcPackage)
  }

  //move to service.
  getUnitConversionToGrams(unitName: string): IUnitConversion {
    return this.conversionService.getConversionItemByName(unitName)
  }

  initFields() {
    this.packageForm = this.inventoryAssignmentService.initFields(this.packageForm)
  }

  getStringValue(item: string): string {
    try {
      const f = this.f
      if (f.get(item).value === undefined || f.get(item).value === null) { return ''} else {
        return  f.get(item).value
      }
    } catch (error) {
      return ''
      console.log('eror reading item', item)
    }
  }

  getValue(item: string): number {
    try {
      const f = this.f
      if (f.get(item).value === undefined || f.get(item).value === null) { return 0 } else {
        return  f.get(item).value
      }
    } catch (error) {
      return 0
    }
  }

  importStrain() {

  }

  notifyEvent(message: string, action: string) {
    this._snackBar.open(message, action, {
      duration: 2000,
      verticalPosition: 'top'
    });
  }

}
