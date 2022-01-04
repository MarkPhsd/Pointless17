import { Component,  Inject,  Input,  OnInit, Optional, AfterContentInit, AfterViewInit} from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { DomSanitizer } from '@angular/platform-browser';
import { FormBuilder, FormGroup, Validators, FormArray, FormControl} from '@angular/forms';
import { MatSnackBar } from '@angular/material/snack-bar';
import { TaxesService } from 'src/app/_services/menu/taxes.service';
import { AWSBucketService, MenuService,  } from 'src/app/_services';
import { ISite } from 'src/app/_interfaces/site';
import { tap } from 'rxjs/operators';
import { MatDialogRef, MAT_DIALOG_DATA} from '@angular/material/dialog';
import { Observable } from 'rxjs';
import { CurrencyPipe } from '@angular/common';
import * as numeral from 'numeral';
import { IItemFacilitiyBasic } from 'src/app/_services/metrc/metrc-facilities.service';
import { InventoryLocationsService, IInventoryLocation } from 'src/app/_services/inventory/inventory-locations.service';
import { InventoryAssignmentService, IInventoryAssignment, Serial } from 'src/app/_services/inventory/inventory-assignment.service';
import { MetrcPackagesService } from 'src/app/_services/metrc/metrc-packages.service';
import { METRCPackage } from 'src/app/_interfaces/metrcs/packages';
import { SitesService } from 'src/app/_services/reporting/sites.service';
import { ConversionsService, IUnitConversion, IUnitsConverted } from 'src/app/_services/measurement/conversions.service';
import { FakeDataService } from 'src/app/_services/system/fake-data.service';
import { PriceCategoriesService } from 'src/app/_services/menu/price-categories.service';

@Component({
  selector: 'app-strains-add',
  templateUrl: './strains-add.component.html',
  styleUrls: ['./strains-add.component.scss']
})

export class StrainsAddComponent implements OnInit {

  productionBatchNumber:  string;
  facilityLicenseNumber:  string;

  get f():                FormGroup  { return this.packageForm as FormGroup};

  get hasImportedControl()          { return this.packageForm.get("hasImported") as FormControl;}
  get activeControl()          { return this.packageForm.get("active") as FormControl;}

  packageForm:            FormGroup;
  bucketName:             string;
  awsBucketURL:           string;

  locationFormArray:      FormGroup;
  id:                     any;
  package:                METRCPackage
  package$:               Observable<METRCPackage>;
  facility = {} as        IItemFacilitiyBasic
  site:                   ISite;
  menuItem:               any ;

  //remove
  intakeConversion        = {}  as IUnitConversion;

  constructor(
          private conversionService: ConversionsService,
          private router: Router,
          public route: ActivatedRoute,
          public fb: FormBuilder,
          private sanitizer : DomSanitizer,
          private awsBucket: AWSBucketService,
          private _snackBar: MatSnackBar,
          private menuPricingService: PriceCategoriesService,
          private taxes: TaxesService,
          private siteService: SitesService,
          private menuService: MenuService,
          private metrcPackagesService: MetrcPackagesService,
          private inventoryLocationsService: InventoryLocationsService,
          private dialogRef: MatDialogRef<StrainsAddComponent>,
          @Inject(MAT_DIALOG_DATA) public data: any,
          private currencyPipe : CurrencyPipe,
          private inventoryAssignmentService: InventoryAssignmentService,
          private fakeData: FakeDataService,
          )
     {

     if (data) {
       this.id = data.id
     } else {
      this.id = this.route.snapshot.paramMap.get('id');
     }

    this.initFields()

   }

  async ngOnInit() {

    try {
      const site = this.siteService.getAssignedSite();
      this.package = await this.metrcPackagesService.getPackagesByID(this.id, site).pipe().toPromise();

      if (this.package) {
        this.bucketName   =  await this.awsBucket.awsBucket();
        this.awsBucketURL =  await this.awsBucket.awsBucketURL();
        this.site         =  this.siteService.getAssignedSite();
        this.initForm();
      }
    } catch (error) {
      console.log(error)
    }


  }

  initForm() {

    if (  this.packageForm ) {
      const  site = this.siteService.getAssignedSite();
      if (this.id) {
        this.package$ = this.metrcPackagesService.getPackagesByID(this.id, site)
        this.package$.subscribe(data =>
          {
            this.initItemFormData(data)
          }
        )
      }
    }

  }

  getStrain(event) {
    const itemStrain = event
    if (itemStrain) {
      if (itemStrain.id) {
        this.menuService.getMenuItemByID(this.site, itemStrain.id).subscribe(data => {
          this.menuItem = data
          }
        )
      }
    }
  }

  updateItem(event) {
    this.update(false)
  }

  updateItemExit(event) {
    this.update(true)
  }

  update(event) {

    if (!this.package) { return }
    const site = this.siteService.getAssignedSite();
    const package$ =this.metrcPackagesService.putPackage(site,this.id, this.package)

    if (this.hasImportedControl) {
      this.package.inventoryImported = this.hasImportedControl.value
    }
    if (this.activeControl) {
      this.package.active = this.activeControl.value
    }

    package$.subscribe(data => {
      this.notifyEvent('Item saved', 'Success')
      if (event) {
        this.onCancel(null)
      }
    })
  }

  deleteItem(event) {
    const alert = window.confirm('Are you sure you want to delete this item? It will reimport when you download again.')
    if (!alert) {return}
    const site = this.siteService.getAssignedSite();
    const package$ =this.metrcPackagesService.deletePackage(site,this.id)
    package$.subscribe(data => {
      this.notifyEvent('Item deleted', 'Success')
      this.onCancel(null)
    })
  }

  onCancel(event) {
    this.dialogRef.close()
  }

  getVendor(event) {

    const facility = event
    if (facility) {
      this.facilityLicenseNumber = `${facility.displayName} - ${facility.metrcLicense}`
      this.facility = event;
    }
  }

  async initItemFormData(data: METRCPackage) {
    if (data) {

      try {
        this.package = data

        this.package.labTestingState =          this.package.labTestingState.match(/[A-Z][a-z]+|[0-9]+/g).join(" ")
        this.facility = {} as                   IItemFacilitiyBasic
        this.facility.displayName =             this.package.itemFromFacilityName
        this.facility.metrcLicense =            this.package.itemFromFacilityLicenseNumber
        this.packageForm.patchValue(data)

        this.intakeConversion = await this.getUnitConversionToGrams(this.package.unitOfMeasureName)

        this.packageForm = this.fb.group({

            productCategoryName:              [data.item.productCategoryName, Validators.required],
            productCategoryType:              [data.item.productCategoryType, Validators.required],
            quantityType:                     [data.item.quantityType, Validators.required],
            productName:                      [data.item.name, Validators.required],
            packageType:                      [data.packageType, Validators.required],
            expiration:                       ['', Validators.required],
            productionBatchNumber:            ['', Validators.required],
            batchDate:                        ['', Validators.required],

            thc:                              [''],
            thc2:                             [''],
            thca:                             [''],
            thca2:                            [''],
            cbn:                              [''],
            cbn2:                             [''],
            cbd:                              [''],
            cbd2:                             [''],
            cbda2:                            [''],
            cbda:                             [''],

            conversionName:                   ['', Validators.required],
            // inputQuantity:                    ['', Validators.required, Validators.pattern(/^-?(0|[1-9]\d*)?$/)],
            inputQuantity:                    [0, Validators.required], // ['', Validators.required,   Validators.pattern("^[0-9]*$")],
            inventoryLocationID:              [0, Validators.required],
            cost:                             [0],
            price:                            [0],
            jointWeight:                      [1],
            facilityLicenseNumber:            [data.itemFromFacilityLicenseNumber],
            intakeUOM:                        [data.unitOfMeasureName],
            intakeConversionValue:            [this.intakeConversion.value],

            active        : [''],
            hasImported   : [''],

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
  async getUnitConversionToGrams(unitName: string): Promise<IUnitConversion> {
    return  await this.conversionService.getConversionItemByName(unitName)
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
      if (f.get(item).value === undefined || f.get(item).value === null) { return 0} else {
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
