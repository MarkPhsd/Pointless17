import { Component,  Inject,  Input,  OnInit, } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { DomSanitizer } from '@angular/platform-browser';
import { FormBuilder, FormGroup, Validators, FormArray} from '@angular/forms';
import { MatSnackBar } from '@angular/material/snack-bar';
import { TaxesService } from 'src/app/_services/menu/taxes.service';
import { AWSBucketService,  MenuService,  } from 'src/app/_services';
import { ISite } from 'src/app/_interfaces/site';
import { MatDialogRef, MAT_DIALOG_DATA} from '@angular/material/dialog';
import { Observable } from 'rxjs';
import { CurrencyPipe } from '@angular/common';
import * as numeral from 'numeral';
import { IItemFacilitiyBasic } from 'src/app/_services/metrc/metrc-facilities.service';
import { InventoryLocationsService, IInventoryLocation } from 'src/app/_services/inventory/inventory-locations.service';
import { InventoryAssignmentService, IInventoryAssignment, Serial } from 'src/app/_services/inventory/inventory-assignment.service';
import { IMenuItem } from 'src/app/_interfaces/menu/menu-products';
import { MetrcPackagesService } from 'src/app/_services/metrc/metrc-packages.service';
import { METRCPackage } from 'src/app/_interfaces/metrcs/packages';
import { SitesService } from 'src/app/_services/reporting/sites.service';
import { ConversionsService, IUnitConversion, IUnitsConverted } from 'src/app/_services/measurement/conversions.service';
import { PriceCategoriesService } from 'src/app/_services/menu/price-categories.service';

@Component({
  selector: 'app-products-add',
  templateUrl: './products-add.component.html',
  styleUrls: ['./products-add.component.scss']
})
export class METRCProductsAddComponent implements OnInit {


  //move to inventory
  conversionName:         string;
  inputQuantity:          number;
  inventoryLocationID:    number;
  inventoryLocationName:  string;
  unitsConverted = {} as  IUnitsConverted;
  unitsRemaining:         number;
  baseUnitsRemaining:     number;
  initialQuantity:        number;
  remainingQuantity:      number;
  inventoryAssigments:    IInventoryAssignment[];
  inventoryLocations$:    Observable<IInventoryLocation[]>;
  inventoryLocations:     IInventoryLocation[];
  inventoryLocation:      IInventoryLocation;

  cost:                   any;
  costValue:              number;

  price:                  any;
  priceValue:             number;

  jointWeight: number;
  productionBatchNumber:  string;
  facilityLicenseNumber:  string;

  get f():                FormGroup  { return this.packageForm as FormGroup};

  bucketName:             string;
  awsBucketURL:           string;

  packageForm:            FormGroup;
  locationFormArray:      FormGroup;
  id:                     any;
  package:                METRCPackage
  package$:               Observable<METRCPackage>;
  facility = {} as        IItemFacilitiyBasic
  unitsOfMeasure =        this.conversionService.getGramsConversions();
  unitOfMeasure:          IUnitConversion;

  thc:   any;
  thc2:  any;
  thca:  any;
  thca2: any;
  cbd:   any;
  cbd2:  any;
  cbn:   any;
  cbn2:  any;
  cbda:   any;
  cbda2:  any;
  site:                   ISite;
  conversions:            IUnitConversion[];
  menuItem:               IMenuItem;

  intakeConversion:         IUnitConversion;
  intakeconversionQuantity: number;
  constructor(
          private conversionService: ConversionsService,
          public route: ActivatedRoute,
          public fb: FormBuilder,
          private awsBucket: AWSBucketService,
          private _snackBar: MatSnackBar,
          private siteService: SitesService,
          private menuService: MenuService,
          private metrcPackagesService: MetrcPackagesService,
          private inventoryLocationsService: InventoryLocationsService,
          private dialogRef: MatDialogRef<METRCProductsAddComponent>,
          @Inject(MAT_DIALOG_DATA) public data: any,
          private currencyPipe : CurrencyPipe,
          private inventoryAssignmentService: InventoryAssignmentService
          )
     {

    if (data) {
      this.id = data.id
    } else {
      this.id = this.route.snapshot.paramMap.get('id');
    }
    this.conversionName = 'Each'

  }

  async ngOnInit() {
    this.bucketName =   await this.awsBucket.awsBucket();
    this.awsBucketURL = await this.awsBucket.awsBucketURL();
    this.unitsConverted = {} as IUnitsConverted;
    this.site =  this.siteService.getAssignedSite();
    this.conversions =  await this.conversionService.getGramsConversions();
    this.inventoryAssigments = [];
    this.inventoryLocations$ =  this.inventoryLocationsService.getLocations()
    this.inventoryLocations$.subscribe(data => {
      this.inventoryLocations = data
    })
    this.initForm();
  }

  initForm() {
    this.initFields()
    if (this.id) {
      this.package$ = this.metrcPackagesService.getPackagesByID(this.id, this.site)
      this.package$.subscribe(data =>
        {
          this.initItemFormData(data)
        }
      )
    }
  }

  async initItemFormData(data: METRCPackage) {
    if (data) {
      this.package = data

      this.intakeConversion = await this.getUnitConversionToGrams(this.package.unitOfMeasureName)
      //convert the package quantity to the grams quantity
      this.intakeconversionQuantity = this.intakeConversion.value * this.package.quantity

      this.package.labTestingState =          this.package.labTestingState.match(/[A-Z][a-z]+|[0-9]+/g).join(" ")
      this.facility = {} as                   IItemFacilitiyBasic
      this.facility.displayName =             this.package.itemFromFacilityName
      this.facility.metrcLicense =            this.package.itemFromFacilityLicenseNumber

      this.packageForm.patchValue(data)
      this.baseUnitsRemaining = this.intakeconversionQuantity
      this.initialQuantity = this.intakeconversionQuantity
      this.packageForm = this.fb.group({

            productCategoryName:              [data.item.productCategoryName, Validators.required],
            productCategoryType:              [data.item.productCategoryType, Validators.required],
            quantityType:                     [data.item.quantityType, Validators.required],
            ProductName:                      [data.item.name, Validators.required],
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

            conversionName:                  ['', Validators.required],
            inputQuantity:                    ['', Validators.required],
            inventoryLocationID:              ['', Validators.required],
            cost:                             [0],
            price:                            [0],
            jointWeight:                      [0],

            intakeUOM:                        [data.unitOfMeasureName],
            intakeConversionValue:            [this.intakeConversion.value]

      })
    }
  }

  async getUnitConversionToGrams(unitName: string): Promise<IUnitConversion> {
    return  await this.conversionService.getConversionItemByName(unitName)
  }


  initFields() {
    this.packageForm = this.fb.group({
      id:                                [''],
      label:                             [''],
      packageType:                       [''],
      sourceHarvestName:                 [''],
      locationID:                        [''],
      locationName:                      [''],
      locationTypeName:                  [''],
      quantity:                          [''],
      unitOfMeasureName:                 [''],
      unitOfMeasureAbbreviation:         [''],
      patientLicenseNumber:              [''],
      itemFromFacilityLicenseNumber:     [''],
      itemFromFacilityName:              [''],
      itemStrainName:                    [''],
      note:                              [''],
      packagedDate:                      [''],
      initialLabTestingState:            [''],
      labTestingState:                   [''],
      labTestingStateDate:               [''],
      isProductionBatch:                 [''],
      productionBatchNumber:             [''],
      sourceProductionBatchNumbers:      [''],
      isTradeSample:                     [''],
      isTradeSamplePersistent:           [''],
      isDonation:                        [''],
      isDonationPersistent:              [''],
      sourcePackageIsDonation:           [''],
      isTestingSample:                   [''],
      isProcessValidationTestingSample:  [''],
      productRequiresRemediation:        [''],
      containsRemediatedProduct:         [''],
      remediationDate:                   [''],
      receivedDateTime:                  [''],
      receivedFromManifestNumber:        [''],
      receivedFromFacilityLicenseNumber: [''],
      receivedFromFacilityName:          [''],
      isOnHold:                          [''],
      archivedDate:                      [''],
      finishedDate:                      [''],
      lastModified:                      [''],
      remainingCount:                    [''],
      inventoryImported:                 [''],
      metrcItemID:                       [''],
      productID:                         [''],
      productName:                       [''],
      productCategoryName:               [''],


      //non data codes
      batchDate:                         [''],
      cost:                              [0],
      price:                             [0],
      jointWeight:                       [0],
      }
    )
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

  getVendor(event) {

    const facility = event
    if (facility) {
      this.facilityLicenseNumber = `${facility.displayName} - ${facility.metrcLicense}`
      this.facility = event;
    }
  }

  getLocationAssignment(id): IInventoryLocation {
    this.inventoryLocation = this.inventoryLocations.find(data =>
      id == data.id
    )
    return this.inventoryLocation
  }

  get assignInventoryArray(): FormArray {
    return this.packageForm.get('assignInventoryArray') as FormArray
  }

  addRemainingInventoryToAssignedGroup() {
    const remainingValue = this.unitsConverted.unitOutPutQuantity
    this.inputQuantity = remainingValue
    this.addInventoryAssignmentGroup();
  }

  async isValidEntry(): Promise<boolean> {

    //check out if the amouunt being input is greater than the allowed amouunt.
    if (this.inputQuantity > this.unitsConverted.unitOutPutQuantity ) {
      this.notifyEvent('Use a smaller quantity.', 'Alert')
      return false
    }

    if (this.inputQuantity == 0 ) {
      this.notifyEvent('Use a quantity.', 'Alert')
      return false
    }

    if (!this.menuItem) {
      this.notifyEvent('Assocate a product with this package!', 'Alert')
      return false
    }

    if (this.getStringValue('productionBatchNumber') === '') {
      this.notifyEvent('Input a batch #.', 'Alert')
      return false
    }

    return true
  }


  async addInventoryAssignmentGroup() {

    const result =  this.isValidEntry()
    console.log("Valid ", !this.isValidEntry())

    //validate entry first:
     if (  !result ) { return  }
    console.log("Valid ", !this.isValidEntry())

    const f = this.f
    this.unitsRemaining = 0
    let inventoryAssignment = {} as IInventoryAssignment

    //assign values to inventoryAssignement
    inventoryAssignment.label = this.package.label

    const index = this.inventoryAssigments.length + 1
    inventoryAssignment.sku = this.generateSku(this.package.label, index);
    inventoryAssignment.metrcPackageID = this.package.id

    let inventoryLocation = this.getLocationAssignment(this.inventoryLocationID);
    inventoryAssignment.locationID = this.inventoryLocation.id
    inventoryAssignment.location = this.inventoryLocation.name
    inventoryAssignment.intakeUOM = this.intakeConversion.name
    inventoryAssignment.intakeConversionValue = this.intakeConversion.value

    if (!this.inventoryLocation.activeLocation) {
      inventoryAssignment.notAvalibleForSale  = true
    } else {
      inventoryAssignment.notAvalibleForSale  = false
    }

    inventoryAssignment.requiresAttention     = false

    //unit of measure being sold or stored in.
    const unitConversion = await this.conversionService.getConversionItemByName('Each')
    inventoryAssignment.unitConvertedtoName =   unitConversion.name
    inventoryAssignment.unitOfMeasureName =     this.package.unitOfMeasureName
    inventoryAssignment.unitMulitplier =        unitConversion.value

    //quantity in this unit of measurement.
    inventoryAssignment.packageQuantity =       this.inputQuantity
    inventoryAssignment.packageCountRemaining = inventoryAssignment.packageQuantity
    inventoryAssignment.baseQuantity =          this.inputQuantity * unitConversion.value
    inventoryAssignment.baseQuantityRemaining = inventoryAssignment.baseQuantity

    inventoryAssignment.productID =             this.menuItem.id
    inventoryAssignment.productName =           this.menuItem.name
    inventoryAssignment.itemStrainName =        this.menuItem.name
    inventoryAssignment.packageType =           this.package.packageType

    inventoryAssignment.employeeName =          localStorage.getItem('username');
    inventoryAssignment.employeeID =            parseInt(localStorage.getItem('userid'));

    const d = new Date();
    inventoryAssignment.dateCreated =           d.toISOString()
    console.log('inventory dateCreated', inventoryAssignment)
    try {
      inventoryAssignment.packageType =         this.getStringValue('packageType')
      inventoryAssignment.productCategoryName = this.getStringValue('productCategoryName')
      inventoryAssignment.thc =                 this.getValue('thc')
      inventoryAssignment.thc2 =                this.getValue('thc2')
      inventoryAssignment.thca2 =               this.getValue('thca2')
      inventoryAssignment.thca =                this.getValue('thca')
      inventoryAssignment.cbn =                 this.getValue('cbn')
      inventoryAssignment.cbn2 =                this.getValue('cbn2')
      inventoryAssignment.cbd =                 this.getValue('cbd')
      inventoryAssignment.cbd2 =                this.getValue('cbd2')
      inventoryAssignment.cbda =                this.getValue('cbda')
      inventoryAssignment.cbda2 =               this.getValue('cbda2')
      inventoryAssignment.batchDate =           this.getStringValue('batchDate')
      inventoryAssignment.expiration =          this.getStringValue('expiration')
    } catch (error) {
      console.log(error)
    }

    inventoryAssignment.facilityLicenseNumber = this.facility.metrcLicense
    const cost =  numeral(+f.get('cost').value).format('0,0');
    this.cost = cost
    const price = numeral(+f.get('price').value).format('0,0');
    this.price = price

    try {
      inventoryAssignment.cost = this.costValue
      inventoryAssignment.price = this.priceValue
    } catch (error) {

    }
    this.inventoryAssigments.push(inventoryAssignment)

    this.unitOfMeasure = {} as IUnitConversion

    this.resetInventoryFormAssignmentValues();

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
      console.log('eror reading item', item)
    }
  }

  convertCurrencyToValue(value: any): number {
    value = value.replace(/\d(?=(\d{3})+\.)/g, '$&,')
    return +value
  }

  resetInventoryFormAssignmentValues() {
    //reset assignmentValues
    console.log('resetInventoryFormAssignmentValues - ran')
    this.inputQuantity = 0;
    this.conversionName = '';
    this.inventoryLocationID = 0;
    this.unitsRemaining = 0
    this.cost = 0;
    this.price = 0;
    this.jointWeight = 1;

    if (this.unitsConverted) {
      this.unitsConverted.unitOutPutQuantity = 0
      this.unitsConverted.ouputRemainder =0
    }
  }


  //joints multiply by conversion rate. joinWeight should always equal 1 if jointWeight is not in use
  //converts units from provided value to desired sale value.
  getAvailableUnits(name) {

    this.unitsConverted = {} as IUnitsConverted;

    if (this.package) {
      this.unitsConverted.unitConvertTo = {} as IUnitConversion
      this.unitsConverted.unitConvertFrom = {} as IUnitConversion

      this.unitsConverted.unitConvertFrom =
        this.conversionService.getConversionItemByName('Grams')

      this.unitsConverted.unitConvertTo =
        this.conversionService.getConversionItemByName(name)

      this.unitsConverted.baseQuantity = this.baseUnitsRemaining

      this.unitsConverted = this.conversionService.getAvailibleQuantityByUnitType(this.unitsConverted, 0)

    }

    this.getAvailableUnitsByQuantity();

  }

  async getAvailableUnitsByQuantity() {
    const site =  this.siteService.getAssignedSite();
     //base is always grams
     this.baseUnitsRemaining = this.inventoryAssignmentService.getSummaryOfGramsUsed(site, this.inventoryAssigments, this.initialQuantity );

    if (this.unitsConverted) {

      if (this.unitsConverted.unitConvertTo) {
        const quantity = (+this.baseUnitsRemaining / +this.unitsConverted.unitConvertTo.value) - +this.inputQuantity
        this.unitsRemaining  = parseInt(quantity.toFixed(2))
      }

    }

    this.unitsRemaining = 0
  }

  transformAmount(element){
    this.costValue = this.cost
    this.cost = this.currencyPipe.transform(this.cost, '$');
    element.target.value = this.cost;
  }

   transformPriceAmount(element){
    this.priceValue = this.price
    this.price = this.currencyPipe.transform(this.price, '$');
    element.target.value = this.price;
  }

  completePackageImport() {
    const site=  this.siteService.getAssignedSite();
    // okay so we have to add the list of inventory assignments to a list.
    const inv$=  this.inventoryAssignmentService.addInventoryList(site, this.inventoryAssigments[0].label,  this.inventoryAssigments)
    inv$.subscribe( data => {
      this.onCancel();
      this.notifyEvent('Inventory Packages Imported', 'Success');
      }, error => {
        this.notifyEvent(`Inventory Packages failed: ${error}`, 'Failed');
      }
    )

  }

//  (outputMenuItem)="getSelectedMenuItem($event)"
// (outputVender)  ="getSelectedVendorItem($event)"

  getSelectedMenuItem(event) {
    if (event) {
      this.menuItem = event;
    }
  }

  getSelectedVendorItem(event) {
    if (event) {
      this.facility = event
    }
  }

  async deleteAssignment(i: any) {
    this.inventoryAssigments.splice(i)
    await this.getAvailableUnitsByQuantity()
  }

  async editAssignment(i: any) {

    if (this.inventoryAssigments[i]) {
      const inv =  this.inventoryAssigments[i]
      if (inv) {
        this.inventoryAssigments.splice(i)
        this.initItemFormData(this.package)
        //assign the values to the form .
        this.packageForm = this.fb.group({
          conversionName:                   [ inv.unitConvertedtoName, Validators.required],
          inputQuantity:                    [ inv.packageQuantity, Validators.required],
          inventoryLocationID:              [ inv.locationID, Validators.required],
          cost:                             [ inv.cost],
          price:                            [ inv.price],
          jointWeight:                      [ 1 ],
          expiration:                       [ inv.expiration],

        })
        await this.getAvailableUnitsByQuantity()
      }
    }

  }

  generateSku(sku: string, index: number): any {
    return this.metrcPackagesService.generateSku(sku, index)
  }

  removeInventoryAssignment(i: number) {
    this.assignInventoryArray.removeAt(i)
  }

  importStrain() {
  }

  onCancel() {
    this.dialogRef.close();
  }

  notifyEvent(message: string, action: string) {
    this._snackBar.open(message, action, {
      duration: 2000,
      verticalPosition: 'top'
    });
  }

}

