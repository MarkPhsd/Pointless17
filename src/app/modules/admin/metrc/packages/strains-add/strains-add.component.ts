import { Component,  Inject,   OnInit,} from '@angular/core';
import { ActivatedRoute,  } from '@angular/router';
import { FormBuilder, FormGroup, Validators, FormControl} from '@angular/forms';
import { MatSnackBar } from '@angular/material/snack-bar';
import { AWSBucketService, MenuService,  } from 'src/app/_services';
import { ISite } from 'src/app/_interfaces/site';
import { MatDialogRef, MAT_DIALOG_DATA} from '@angular/material/dialog';
import { Observable } from 'rxjs';
import { IItemFacilitiyBasic } from 'src/app/_services/metrc/metrc-facilities.service';
import { InventoryAssignmentService} from 'src/app/_services/inventory/inventory-assignment.service';
import { MetrcPackagesService } from 'src/app/_services/metrc/metrc-packages.service';
import { METRCPackage } from 'src/app/_interfaces/metrcs/packages';
import { SitesService } from 'src/app/_services/reporting/sites.service';
import { ConversionsService, IUnitConversion } from 'src/app/_services/measurement/conversions.service';

@Component({
  selector: 'app-strains-add',
  templateUrl: './strains-add.component.html',
  styleUrls: ['./strains-add.component.scss']
})

export class StrainsAddComponent implements OnInit {

  productionBatchNumber:  string;
  facilityLicenseNumber:  string;

  get f():                FormGroup  { return this.packageForm as FormGroup};

  get hasImportedControl(){ return this.packageForm.get("hasImported") as FormControl;}
  get activeControl()     { return this.packageForm.get("active") as FormControl;}

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
  intakeconversionQuantity : number;  // this.intakeConversion.value * this.package.quantity
  baseUnitsRemaining       : number; //= this.intakeconversionQuantity
  initialQuantity          : number; // this.intakeconversionQuantity

  constructor(
          private conversionService: ConversionsService,
          public route: ActivatedRoute,
          public fb: FormBuilder,
          private awsBucket: AWSBucketService,
          private _snackBar: MatSnackBar,
          private siteService: SitesService,
          private menuService: MenuService,
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

    if (this.hasImportedControl) { this.package.inventoryImported = this.hasImportedControl.value }
    if (this.activeControl)      { this.package.active = this.activeControl.value }

    package$.subscribe(data => {
      this.notifyEvent('Item saved', 'Success')
      if (event) {
        this.onCancel(null)
      }
    })
  }

  deleteItem(event) {
    const alert    = window.confirm('Are you sure you want to delete this item? It will re-import when you download again.')
    if (!alert) {return}
    const site     = this.siteService.getAssignedSite();
    const package$ = this.metrcPackagesService.deletePackage(site,this.id)
    package$.subscribe(data => {
      this.notifyEvent('Item deleted', 'Success')
      this.onCancel(null)
    })
  }

  closePackage(event) {
    console.log('close package', event)
    if (event) {
      const data = { completed: true}
      this.dialogRef.close(data)
    }
  }

  onCancel(event) {
    this.dialogRef.close()
  }

  getVendor(event) {
    const facility = event
    if (facility) {
      this.facilityLicenseNumber = `${facility.displayName} - ${facility.metrcLicense}`
      this.facility = event;
      this.packageForm.patchValue({ facilityLicenseNumber: [this.facilityLicenseNumber],})
    }
  }

  getCatalogItem(event) {
    const itemStrain = event
    if (itemStrain) {
      if (itemStrain.id) {
        this.menuService.getMenuItemByID(this.site, itemStrain.id).subscribe(data => {
          if (data){
            this.menuItem = data
            this.packageForm.patchValue({
              productName: [data.name],
              productID  : [data.id],
            })
            return;
          }
          this.setProductNameEmpty(this.packageForm)
        }
        )
      }
    }
  }

  setProductNameEmpty(inputForm: FormGroup) {
    inputForm.patchValue({
      productName: [''],
      productID:  ['']
    })
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

  initItemFormData(data: METRCPackage) {
    if (data) {
      try {
        this.package = data
        this.package.labTestingState =          this.package.labTestingState.match(/[A-Z][a-z]+|[0-9]+/g).join(" ")
        this.facility = {} as                   IItemFacilitiyBasic
        this.facility.displayName =             this.package.itemFromFacilityName
        this.facility.metrcLicense =            this.package.itemFromFacilityLicenseNumber

        if (this.package.unitOfMeasureName) {
          this.intakeConversion = this.conversionService.getConversionItemByName(this.package.unitOfMeasureName)
          //convert the package quantity to the grams quantity
          if (!this.intakeConversion.value) {this.intakeConversion.value = 1}
          if (this.intakeConversion) {
            this.intakeconversionQuantity = this.intakeConversion.value * this.package.quantity
          } else {
            this.notifyEvent('Intake conversion not initialized', 'Alert')
          }
          this.baseUnitsRemaining = this.intakeconversionQuantity
          this.initialQuantity    = this.intakeconversionQuantity
        }

        this.packageForm.patchValue(data)
        this.setProductNameEmpty(this.packageForm);

        let active = true
        if (this.package.active != 0)  { active = false; }

        // this can use to assign the item to the form.
        const facility = `${data.itemFromFacilityLicenseNumber}-${data.itemFromFacilityName}`

        this.packageForm.patchValue({
            productCategoryName:              [data.item.productCategoryName],
            productCategoryType:              [data.item.productCategoryType],
            quantityType:                     [data.item.quantityType],
            productname                    :  [''],
            inputQuantity:                    [0],
            inventoryLocationID:              [0],
            cost:                             [0],
            price:                            [0],
            jointWeight:                      [1],
            facilityLicenseNumber:            [facility],
            active                      :     [active],
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
