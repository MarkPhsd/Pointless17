import { Component,  Inject,   Input,   OnInit,} from '@angular/core';
import { ActivatedRoute,  } from '@angular/router';
import { UntypedFormBuilder, UntypedFormGroup, Validators, UntypedFormControl} from '@angular/forms';
import { MatLegacySnackBar as MatSnackBar } from '@angular/material/legacy-snack-bar';
import { AWSBucketService, AuthenticationService, MenuService,  } from 'src/app/_services';
import { ISite } from 'src/app/_interfaces/site';
import { MatLegacyDialogRef as MatDialogRef, MAT_LEGACY_DIALOG_DATA as MAT_DIALOG_DATA} from '@angular/material/legacy-dialog';
import { Observable, of, switchMap } from 'rxjs';
import { IItemFacilitiyBasic } from 'src/app/_services/metrc/metrc-facilities.service';
import { InventoryAssignmentService} from 'src/app/_services/inventory/inventory-assignment.service';
import { MetrcPackagesService } from 'src/app/_services/metrc/metrc-packages.service';
import { METRCPackage } from 'src/app/_interfaces/metrcs/packages';
import { SitesService } from 'src/app/_services/reporting/sites.service';
import { ConversionsService, IUnitConversion } from 'src/app/_services/measurement/conversions.service';
import { ProductSearchModel } from 'src/app/_interfaces/search-models/product-search';
import { UserPreferences } from 'src/app/_interfaces';
import { IInventoryLocation, InventoryLocationsService } from 'src/app/_services/inventory/inventory-locations.service';

@Component({
  selector: 'app-strains-add',
  templateUrl: './strains-add.component.html',
  styleUrls: ['./strains-add.component.scss']
})

export class StrainsAddComponent implements OnInit {

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
          private inventoryLocationsService: InventoryLocationsService,
          private metrcPackagesService: MetrcPackagesService,
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

    this.initFields();
  }

  async ngOnInit() {
    this.initProductSearchModel();
    const site        = this.siteService.getAssignedSite();
    this.site         = this.siteService.getAssignedSite();
    const item$       = this.metrcPackagesService.getPackagesByID(this.id, site) //.pipe().toPromise();
    this.bucketName   =  await this.awsBucket.awsBucket();
    this.awsBucketURL =  await this.awsBucket.awsBucketURL();

    item$.subscribe(
      {
        next: data => {
          this.package = data;
          if (this.package) {
            if (this.package.productID) {
              this.assignMenItem(+this.package.productID)
            }
            this.initForm();
            this.initPriceForm();
          }
        },
        error: err => {
          console.log('error', err)
        }
      }
    )
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

    const package$       = this.metrcPackagesService.putPackage(site, this.id, metrcPackage)
    package$.subscribe( data => {
      this.notifyEvent('Item saved', 'Success')
      if (event) { this.onCancel(null) }
    })

    this.saved = true
    this.packageForm.valueChanges.subscribe(data => {
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
    if (id == 0) { return}
    this.menuService.getMenuItemByID(this.site, id).subscribe(data => {
      if (data) {
        this.menuItem = data
        console.log( 'results', this.menuItem, this.packageForm.value)
        const item = {productName: data.name, productID: data.id}
        this.packageForm.patchValue(item)
        return;
      }
      this.setProductNameEmpty(this.packageForm)
    })
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
        this.facility.displayName =             this.package.itemFromFacilityName;
        this.facility.metrcLicense =            this.package.itemFromFacilityLicenseNumber;

        if (this.package.unitOfMeasureName) {
          this.intakeConversion = this.conversionService.getConversionItemByName(this.package.unitOfMeasureName);
          //convert the package quantity to the grams quantity
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
        const facility = `${data?.itemFromFacilityLicenseNumber}-${data?.itemFromFacilityName}`

        console.log('metrcPackage Data', data)
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
            facilityLicenseNumber:            facility,
            active                      :     active,
            sellByDate                  : data?.sellByDate,
            labTestingPerformedDate     : data?.labTestingPerformedDate,
            packagedDate                : data?.packagedDate,
            expirationDate              : data?.expirationDate,
            useByDate                   : data?.useByDate,
            productionBatchNumber       : data?.productionBatchNumber,
            productName                 : data?.productName,
            productID                   : data?.productID,
        })

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
    return   this.conversionService.getConversionItemByName(unitName)
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
