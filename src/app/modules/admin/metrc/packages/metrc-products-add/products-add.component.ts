import { Component, Inject,  Input,  OnInit, } from '@angular/core';
import { ActivatedRoute,  } from '@angular/router';
import { UntypedFormBuilder, UntypedFormGroup, Validators, UntypedFormArray, UntypedFormControl} from '@angular/forms';
import { MatLegacySnackBar as MatSnackBar } from '@angular/material/legacy-snack-bar';
import { AWSBucketService,  AuthenticationService,  MenuService,  } from 'src/app/_services';
import { ISite } from 'src/app/_interfaces/site';
import { MatLegacyDialogRef as MatDialogRef, MAT_LEGACY_DIALOG_DATA as MAT_DIALOG_DATA} from '@angular/material/legacy-dialog';
import { Observable, of, switchMap } from 'rxjs';
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
import { UserPreferences } from 'src/app/_interfaces';

@Component({
  selector: 'app-products-add',
  templateUrl: './products-add.component.html',
  styleUrls: ['./products-add.component.scss']
})
export class METRCProductsAddComponent implements OnInit {
  //move to inventory
  saved: boolean;
  action$ : Observable<any>;
  conversionName:         string;
  inputQuantity:          number;
  inventoryLocationID:    number;
  inventoryLocationName:  string;
  unitsConverted = {} as  IUnitsConverted;
  unitsRemaining:         number;
  baseUnitsRemaining:     number ;
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

  showJSONData: boolean; //togggles the form and viewing raw data.

  get f():                UntypedFormGroup  { return this.packageForm as UntypedFormGroup};
  get hasImportedControl()          { return this.packageForm.get("hasImported") as UntypedFormControl;}
  get activeControl()          { return this.packageForm.get("active") as UntypedFormControl;}

  get userPref() {
    if (this.authenticationService._user.value) {
      const user = this.authenticationService._user.value;

      const userPref  = this.authenticationService._user.value.userPreferences;
      if (userPref ) {
        return userPref 
      }

      try {
        if (user) {
          const pref = this.authenticationService._user.value.preferences;
          const preferences = JSON.parse(pref) as UserPreferences;
          return preferences;
        }
      } catch (error) {
        this.siteService.notify('Error user pref', 'Close', 3000, 'red')        
      }
    }
    return {} as UserPreferences;
  }

  get jsonData() {
    if (this.package) {
      if (this.package.json) {
        return JSON.parse(this.package?.json)

        // this.package.productCategoryName
      }
    }
  }
  bucketName:             string;
  awsBucketURL:           string;

  @Input() priceForm   :  UntypedFormGroup;
  packageForm:            UntypedFormGroup;
  locationFormArray:      UntypedFormGroup;
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
          public  route: ActivatedRoute,
          public  fb: UntypedFormBuilder,
          private awsBucket: AWSBucketService,
          private _snackBar: MatSnackBar,
          private siteService: SitesService,
          private menuService: MenuService,
          private metrcPackagesService: MetrcPackagesService,
          private inventoryLocationsService: InventoryLocationsService,
          private dialogRef: MatDialogRef<METRCProductsAddComponent>,
          @Inject(MAT_DIALOG_DATA) public data: any,
          private currencyPipe : CurrencyPipe,
          private authenticationService: AuthenticationService,
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
    this.bucketName     = await this.awsBucket.awsBucket();
    this.awsBucketURL   = await this.awsBucket.awsBucketURL();
    this.unitsConverted = {} as IUnitsConverted;
    this.site           =  this.siteService.getAssignedSite();
    this.conversions    =  this.conversionService.getGramsConversions();
    this.inventoryAssigments = [];
    this.inventoryLocations$ =  this.setInventoryLocation()
    this.initForm();
  }

  setInventoryLocation() {
    return  this.inventoryLocationsService.getLocations().pipe(switchMap(data => {
      this.inventoryLocations = data
      if (data) {
        data.forEach(item => {
          if (item.defaultLocation) {
            this.getLocationAssignment(item.id);
            this.inventoryLocationID = item.id;
          }
        });
       }
      return of(data)
    }))
  }

  initForm() {
    this.initFields()
    if (this.id) {
      this.package$ = this.metrcPackagesService.getPackagesByID(this.id, this.site)
      this.action$ =  this.package$.pipe(
        switchMap(data =>
        {
          if (data) {
            this.initItemFormData(data)
          }
          return of(data)
        }
      ))
    }
  }

  initItemFormData(data: METRCPackage) {
    if (data) {
        data = this.convertValuesToString(data)
        this.package = data
        if (this.package) {
          if (this.package.unitOfMeasureName && this.package?.unitOfMeasureName.toLocaleLowerCase() === 'each') {
            this.inputQuantity = this.package?.quantity;
          }
        }

        if (this.package.unitOfMeasureName) {
          this.intakeConversion = this.conversionService.getConversionItemByName(this.package?.unitOfMeasureName)
          this.intakeconversionQuantity = +this.intakeConversion.value * +this.package?.quantity
          this.baseUnitsRemaining = +this.intakeconversionQuantity
          this.initialQuantity    = +this.intakeconversionQuantity
        }
        console.log(' initItemFormData baseUnitsRemaining' , this.baseUnitsRemaining)
        this.package.labTestingState =          this.package?.labTestingState.match(/[A-Z][a-z]+|[0-9]+/g).join(" ")
        this.facility = {} as                   IItemFacilitiyBasic
        this.facility.displayName =             this.package?.itemFromFacilityName
        this.facility.metrcLicense =            this.package?.itemFromFacilityLicenseNumber

        this.packageForm.patchValue(data)
        this.setProductNameEmpty(this.packageForm);

        let active = true
        if (!this.package.active)  {   active = false;   }

        const facility = `${data?.itemFromFacilityLicenseNumber}-${data?.itemFromFacilityName}`

        this.packageForm.patchValue({
          productCategoryName:              data?.item?.productCategoryName,
          productCategoryType:              data?.item?.productCategoryType,
          quantityType:                     data?.item?.quantityType,
          productName:                      data?.item?.name,
          productname                    :  '',
          inputQuantity:                    0,
          inventoryLocationID:              0,
          cost:                             0,
          price:                            0,
          jointWeight:                      1,
          facilityLicenseNumber:            facility,
          intakeConversionValue:            this.intakeConversion?.value,
          active                        : active,
          sellByDate                    : data?.sellByDate,
          labTestingPerformedDate       : data?.labTestingStateDate.toString(),
          packagedDate                  : data?.packagedDate.toString(),
          expirationDate                : data?.expirationDate,
          useByDate                     : data?.useByDate,
          productionBatchNumber         : data?.productionBatchNumber
      })
        console.log('form initialized', this.packageForm.value)
      }
    }

  // Utility function to convert all values to strings
  convertValuesToString(obj: any): any {
    if (typeof obj === 'string') {
      return obj;
    } else if (Array.isArray(obj)) {
      return obj.map(item => item.toString());
    } else if (typeof obj === 'object' && obj !== null) {
      const result: any = {};
      for (const key in obj) {
        if (obj.hasOwnProperty(key)) {
          result[key] = this.convertValuesToString(obj[key]);
        }
      }
      return result;
    } else {
      if (obj) {
        return obj.toString();
      }
      return obj
    }
  }

  editAssignment(i: any) {

    if (this.inventoryAssigments[i]) {
      const inv =  this.inventoryAssigments[i]
      if (inv) {
        this.inventoryAssigments.splice(i)
        this.initItemFormData(this.package)

        const item = {converstionName: inv?.unitConvertedtoName,
          inputQuantity: inv.packageQuantity,
          inventoryLocationID: inv.locationID,
          cost          : inv?.cost,
          price         : inv?.price,
          jointWeight   : 1,
          expirationDate: inv?.expiration}

        this.packageForm.patchValue(item)
        this.getAvailableUnitsByQuantity()
      }
    }
  }

  setProductNameEmpty(inputForm: UntypedFormGroup) {
    inputForm.patchValue({
      productName: [''],
      productID:  ['']
    })
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
      if (this.activeControl.value) {   this.package.active = true  }
      if (!this.activeControl.value) {  this.package.active = false  }
    }

    package$.subscribe(data => {
      this.notifyEvent('Item saved', 'Success')
      if (event) {
        this.onCancel(null)
      }
    })

    this.saved = true
    this.packageForm.valueChanges.subscribe(data => {
      // this.saved = false;
    })

  }

  deleteItem(event) {
    // const alert = window.confirm('Are you sure you want to delete this item? It will reimport when you download again.')
    // if (!alert) {return}
    const site = this.siteService.getAssignedSite();
    const package$ =this.metrcPackagesService.deletePackage(site,this.id)
    package$.subscribe(data => {
      this.notifyEvent('Item deleted', 'Success')
      this.onCancel('true')
    })
  }

  onCancel(event) {
    this.dialogRef.close(event)
  }

  initFields() {
    this.packageForm = this.inventoryAssignmentService.initFields(this.packageForm)
  }

  getStrain(event) {
    const itemStrain = event
    if (itemStrain) {
      if (itemStrain.id) {
        this.menuService.getMenuItemByID(this.site, itemStrain.id).subscribe(data => {
            if (data) {
              this.menuItem = data
            } else {
              this.menuItem = null;
            }
          }
        )
      }
    }
  }

  getVendor(event) {
    const facility = event
    if (facility) {
      this.facilityLicenseNumber = `${facility.metrcLicense}-${facility.displayName}`
      this.facility = event;
    }
  }

  getLocationAssignment(id): IInventoryLocation {
    this.inventoryLocation = this.inventoryLocations.find(data =>
      id == data.id
    )
    return this.inventoryLocation
  }

  get assignInventoryArray(): UntypedFormArray {
    return this.packageForm.get('assignInventoryArray') as UntypedFormArray
  }

  addRemainingInventoryToAssignedGroup() {
    const remainingValue = this.unitsConverted.unitOutPutQuantity
    this.inputQuantity = remainingValue
    this.addInventoryAssignmentGroup();
  }

  async isValidEntry(): Promise<boolean> {
    //check out if the amouunt being input is greater than the allowed amouunt.
    // console.log('this.unitsConverted.unitOutPutQuantity', this.unitsConverted.unitOutPutQuantity);
    // console.log('this.inputquantity', this.inputQuantity);

    if (this.inventoryLocation || !this.inventoryLocation.name) {
      this.notifyEvent('Please chose a location.', 'Alert')
      return false
    }

    if (+this.inputQuantity >  +this.baseUnitsRemaining  ) {
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

    // if (this.getStringValue('productionBatchNumber') === '') {
    //   this.notifyEvent('Input a batch #.', 'Alert')
    //   return false
    // }

    return true
  }


  get isPackageReady() {
    //
    // const batchNumber = this.package.productionBatchNumber
    // const batchNumber = this.package.packagedDate;
    return true;

    if (this.saved) {
      const inv = this.packageForm.value as IInventoryAssignment
      return true;
      if (inv.batchDate &&
          inv.productionBatchNumber &&
          inv.testDate) {
            return true;
          }
      }

    return false
  }


  addInventoryAssignmentGroup() {
    const result =  this.isValidEntry()
    //validate entry first:
     if ( !result ) { return  }

    const f = this.f
    this.unitsRemaining = 0
    let inventoryAssignment = {} as IInventoryAssignment

    //assign values to inventoryAssignement
    inventoryAssignment.label = this.package?.label
    inventoryAssignment.sku = this.package?.label
    if (!this.userPref?.metrcUseMetrcLabel) {
      const index = this.inventoryAssigments.length + 1
      inventoryAssignment.sku = this.generateSku(this.package.label, index);
      inventoryAssignment.metrcPackageID = this.package.id
    }

    let inventoryLocation = this.getLocationAssignment(this.inventoryLocationID);
    if (inventoryLocation) { 
      inventoryAssignment.locationID                 = this.inventoryLocation?.id
      inventoryAssignment.location                   = this.inventoryLocation?.name
      inventoryAssignment.intakeUOM                  = this.intakeConversion?.name
      inventoryAssignment.intakeConversionValue      = this.intakeConversion?.value
    }

    if (!this.inventoryLocation.activeLocation) {
      inventoryAssignment.notAvalibleForSale  = true
    } else {
      inventoryAssignment.notAvalibleForSale  = false
    }

    inventoryAssignment.requiresAttention     = false

    if (this.package) {
      if (this.package.packagedDate) {
        this.packageForm.patchValue({batchDate: this.package.packagedDate })
      }
      if (this.package.labTestingStateDate) {
        this.packageForm.patchValue({testDate: this.package.labTestingStateDate })
      }

    }

    //unit of measure being sold or stored in.
    const unitConversion = this.conversionService.getConversionItemByName('Each')
    inventoryAssignment.unitConvertedtoName =   unitConversion.name
    inventoryAssignment.unitOfMeasureName =     this.package?.unitOfMeasureName
    inventoryAssignment.unitMulitplier =        unitConversion.value

    //quantity in this unit of measurement.
    inventoryAssignment.packageQuantity =       this.inputQuantity
    inventoryAssignment.packageCountRemaining = inventoryAssignment?.packageQuantity
    inventoryAssignment.baseQuantity =          this.inputQuantity * unitConversion?.value
    inventoryAssignment.baseQuantityRemaining = inventoryAssignment?.baseQuantity

    inventoryAssignment.productID =             this.menuItem?.id
    inventoryAssignment.productName =           this.menuItem?.name
    inventoryAssignment.itemStrainName =        this.menuItem.name
    inventoryAssignment.packageType =           this.package?.packageType

    inventoryAssignment.employeeName =          localStorage.getItem('username');
    inventoryAssignment.employeeID =            parseInt(localStorage.getItem('userid'));

    const d = new Date();
    inventoryAssignment.dateCreated =           d.toISOString()
    // inventoryAssignment =  this.getPriceValues(inventoryAssignment)
    try {
      inventoryAssignment.packageType =         this.getStringValue('packageType')
      inventoryAssignment.productCategoryName = this.package.productCategoryName;
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
      inventoryAssignment.thcContent =          this.getValue('thcContent')
      inventoryAssignment.productionBatchNumber=this.getStringValue('productionBatchNumber')
      inventoryAssignment.batchDate =           this.getStringValue('batchDate')
      inventoryAssignment.expiration =          this.getStringValue('expiration')
      inventoryAssignment.testDate =            this.getStringValue('testDate')
    } catch (error) {
      this.siteService.notify('Error Occured' + error.toString(), 'Close', 50000, 'red' )
      console.log(error)
    }

    // inventoryAssignment.facilityLicenseNumber = this.facility.metrcLicense
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

  getPriceValues(item: IInventoryAssignment) {
    if (this.priceForm && item) {
      const priceCategoryID = this.priceForm.controls['priceCategoryID'].value;
      const cost   = this.priceForm.controls['cost'].value;
      const price  = this.priceForm.controls['price'].value;
      item.priceCategoryID = priceCategoryID;
      item.cost    = cost;
      item.price   = price
    }
    return item;
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
    this.inputQuantity = 0;
    this.conversionName = '';
    this.inventoryLocationID = 0;
    this.unitsRemaining = 0
    this.cost = 0;
    this.price = 0;
    this.jointWeight = 1;
    this.baseUnitsRemaining = 0;
    if (this.unitsConverted) {
      this.unitsConverted.unitOutPutQuantity = 0
      this.unitsConverted.ouputRemainder = 0
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
      this.unitsConverted.baseQuantity = +this.baseUnitsRemaining
      this.unitsConverted = this.conversionService.getAvailibleQuantityByUnitType(this.unitsConverted, 0)
    }

    this.getAvailableUnitsByQuantity();
  }

  getAvailableUnitsByQuantity() {
    const site =  this.siteService.getAssignedSite();
     //base is always grams
     this.baseUnitsRemaining = +this.inventoryAssignmentService.getSummaryOfGramsUsed(site, this.inventoryAssigments, this.initialQuantity );
     console.log('baseUnitsRemaining' , this.baseUnitsRemaining)
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

    this.inventoryAssigments.forEach(data => {data.metrcPackageID = this.package.id })
    const inv$=  this.inventoryAssignmentService.addInventoryList(site, this.inventoryAssigments[0].label,
                                                                  this.inventoryAssigments)
    this.action$ = inv$.pipe(switchMap(data => { 

      if (!data) { 
        this.siteService.notify('Inventory Packages note imported', 'Failed', 2000, 'red');
        return of(data)
      }

      this.siteService.notify('Inventory Packages Imported', 'Success', 2000, 'green');
      if (this.userPref?.metrcUseMetrcLabel) {
        if (this.inventoryAssigments[0].label === this.package.label) {
          if (data) {
            const item = data[0]
            const dialogRef = this.inventoryAssignmentService.openInventoryItem(data[0].id)
          }
          
        }
        return of(data)
      }
    
    }))

  }
    //     error: error => {
    //       this.notifyEvent(`Inventory Packages failed: ${error}`, 'Failed');
    //   }
    // }
    // )


  // getSelectedMenuItem(event) {
  //   if (event) {
  //     this.menuItem = event;
  //   }
  // }

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
        this.package.productID = data?.id.toString();
        this.package.productName = data?.name
        const item = {productName: data.name, productID: data.id}
        this.packageForm.patchValue(item)
        return;
      }
      this.setProductNameEmpty(this.packageForm)
    })
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

  removeInventoryAssignment(i: number) {
    this.assignInventoryArray.removeAt(i)
  }

  importStrain() {
  }

  notifyEvent(message: string, action: string) {
    this._snackBar.open(message, action, {
      duration: 2000,
      verticalPosition: 'top'
    });
  }

  generateSku(sku: string, index: number): any {
    return this.metrcPackagesService.generateSku(sku, index)
    if (this.userPref?.metrcUseMetrcLabel) {
    } else
      return this.metrcPackagesService.generateSku(sku, index)

  }


}

