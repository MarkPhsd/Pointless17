import { Component,  Inject,  Input,  OnInit, Optional, AfterContentInit, AfterViewInit, Output, EventEmitter} from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { DomSanitizer } from '@angular/platform-browser';
import { FormBuilder, FormGroup, Validators, FormArray, FormControl} from '@angular/forms';
import { MatSnackBar } from '@angular/material/snack-bar';
import { TaxesService } from 'src/app/_services/menu/taxes.service';
import { AWSBucketService, MenuService,  } from 'src/app/_services';
import { ISite } from 'src/app/_interfaces/site';
import { tap } from 'rxjs/operators';
import { MatDialogRef, MAT_DIALOG_DATA} from '@angular/material/dialog';
import { Observable, Subject } from 'rxjs';
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
import { InteractivityChecker } from '@angular/cdk/a11y';
import { FakeDataService } from 'src/app/_services/system/fake-data.service';
import { ReversePipe } from 'ngx-pipes';
import { StrainsAddComponent } from '../strains-add.component';
import { PriceCategoriesService } from 'src/app/_services/menu/price-categories.service';

@Component({
  selector: 'app-strain-packages',
  templateUrl: './strain-packages.component.html',
  styleUrls: ['./strain-packages.component.scss'],
  providers: [ReversePipe]
})

export class StrainPackagesComponent implements OnInit {

  get _jointWeightValue() {return this.packageForm.get("jointWeightValue") as FormControl;}
  @Output() outputPackage        : EventEmitter<any> = new EventEmitter();
  @Output()  outoutClosePackage  : EventEmitter<any> = new EventEmitter();
  @Input()   package             : METRCPackage;
  @Input()   menuItem              : IMenuItem;
  @Input() packageForm           : FormGroup;
  @Input() facility = {} as        IItemFacilitiyBasic
  @Input() facilityLicenseNumber : string;
  inventoryLocationID: number ;

  get f():                FormGroup  { return this.packageForm as FormGroup};

  //move to inventory
  conversionName        = '';

  inputQuantity         :    any;
  inventoryLocationName:  string;
  unitsConverted          = {} as  IUnitsConverted;
  unitsRemaining        : number;
  baseUnitsRemaining    : number;
  initialQuantity       : number;
  remainingQuantity     : number;

  conversions           : IUnitConversion[];
  cost:                   any;
  costValue:              number;
  price:                  any;
  priceValue:             number;
  jointWeight=            1;

  unitsOfMeasure =        this.conversionService.getGramsConversions();
  unitOfMeasure:          IUnitConversion;
  intakeConversion        : IUnitConversion;
  intakeconversionQuantity: number;

  inventoryAssignments:    IInventoryAssignment[];
  inventoryLocations$:     Observable<IInventoryLocation[]>;
  inventoryLocations:      IInventoryLocation[];
  inventoryLocation:       IInventoryLocation;

  get assignInventoryArray(): FormArray {
    return this.packageForm.get('assignInventoryArray') as FormArray
  }

  // this.packageForm.valueChanges.subscribe(
  //   (value: string) => {
  //     console.log('form changed to: ', value);
  //   }
  // );
  processUnitCount       = true;
  processJointWeight     = true;
  processUnitConversion  = true;

  constructor(
    private conversionService: ConversionsService,
    public route: ActivatedRoute,
    public fb: FormBuilder,
    private _snackBar: MatSnackBar,
    private siteService: SitesService,
    private metrcPackagesService: MetrcPackagesService,
    private inventoryLocationsService: InventoryLocationsService,
    // private dialogRef: MatDialogRef<StrainsAddComponent>,
    // @Inject(MAT_DIALOG_DATA) public data: any,
    private currencyPipe : CurrencyPipe,
    private inventoryAssignmentService: InventoryAssignmentService,

    )
  {
    // if (data) {
    //   this.package = data;
    // }
    // console.log(data)
  }

  async ngOnInit() {

    this.conversions =  await this.conversionService.getGramsConversions();
    this.unitsConverted = {} as IUnitsConverted;
    this.inventoryAssignments = [];
    this.inventoryLocations$ =  this.inventoryLocationsService.getLocations()
    this.inventoryLocations$.subscribe(data => {  this.inventoryLocations = data })
    this.intakeConversion = await this.getUnitConversionToGrams(this.package.unitOfMeasureName)
    this.intakeconversionQuantity = this.intakeConversion.value * this.package.quantity
    this.baseUnitsRemaining = this.intakeconversionQuantity
    this.initialQuantity = this.intakeconversionQuantity

  }

  onjointValueChange(e) {
    console.log(e)
  }

  getLocationAssignment(id): IInventoryLocation {
    return  this.inventoryLocations.find(data => id == data.id  )
  }

  getUnitConversionToGrams(unitName: string): IUnitConversion {
    return  this.conversionService.getConversionItemByName(unitName)
  }

  generateSku(sku: string, index: number): any {
    return this.metrcPackagesService.generateSku(sku, index)
  }

  outPutPackage(metrcPackage: METRCPackage) {
    this.outputPackage.emit(metrcPackage)
  }

  getAvailableUnitsByInputQuantity(event): number {

    //if this item is being edited.
    //then we want to let the other items know that they can't be edited.
    //except that they will be, so we send a true statement, and that true
    //tells the other text inputs to not process their change.
    //but before they exit the method, then turn off the sswitch.
    // console.log('getAvailableUnitsByInputQuantity')
    // if (this.processUnitCount == true) {
    //   console.log('getAvailableUnitsByInputQuantity - disabled')
    //   // this.processUnitCount   = false;
    //   return
    // }

    if (!event) { return }

    this.inputQuantity = parseInt(this.inputQuantity)

    this.processFields(true, false, true)

    return this.getAvailableUnits(false)

  }

  getAvailableUnitsByConversion(event) {

    // console.log('getAvailableUnitsByConversion')
    // if (this.processUnitConversion == true) {
    //   console.log('getAvailableUnitsByConversion - disabled')
    //     this.processUnitConversion  = false;
    //     return
    // }

    if (!event) { return }

    this.conversionName = event;

    this.processFields(true, true, false)

    return this.getAvailableUnits(false)

  }

  getQuantityByJointCount(event) {

    // console.log('getQuantityByJointCount')
    // if (this.processJointWeight == true) {
    //   console.log('getQuantityByJointCount - disabled')
    //   this.processJointWeight  = false;
    //   return
    // }

    if (!event) { return };
    // this.jointWeight = event;

    this.getAvailableUnits(true);

    this.processFields(true, false, true)
    //this method is called from the JointWeight Input, so if it's zero, reset the values of conversion.
    if( this.jointWeight == 0 ) {
      this.inputQuantity = ''
      this.jointWeight = 1
      this.processJointWeight = false
      return
    }

    this.processFields(true, false, true)
    //this is required for this field, it can't be apply from the other fields because we don't if it's being used.
    return

  }

  processFields(processUnitCount: boolean,processJointWeight: boolean ,processUnitConversion: boolean) {

    this.processUnitCount       = processUnitCount;
    this.processJointWeight     = processJointWeight;
    this.processUnitConversion  = processUnitConversion;

  }

  getAvailableUnits(usingJointsField: boolean): number {

    const site =  this.siteService.getAssignedSite();

    //gets summary of remaining Grams.
    //grams are always the base unit.
    console.log('get avalible units initial quantity ', this.initialQuantity)
    this.baseUnitsRemaining = this.inventoryAssignmentService.getSummaryOfGramsUsed( site, this.inventoryAssignments, this.initialQuantity );
    console.log('returned base units remaining ', this.baseUnitsRemaining)

    this.validateQuantities();

    let unitsConverted = this.initPackageConversion();

    if ( this.jointWeight == 0 ) {

      this.jointWeight = 1}

    try {

      let totalInputQuantity =  0;

      totalInputQuantity = this.jointWeight * this.inputQuantity * unitsConverted.unitConvertTo.value;
      console.log('Total Input QUantity', totalInputQuantity)
      if (!usingJointsField) {

        //if we are only selecting the conversion type, not entering a value for quantity or joint weight.
        if ( totalInputQuantity == 0 )  { return };
        // console.log('outputUnitQuantity', this.unitsConverted.unitOutPutQuantity)
        // this.inputQuantity = Math.floor(this.unitsConverted.unitOutPutQuantity / this.inputQuantity)
      }

      if (usingJointsField) {
        //now we can set the InputQuantity if the join Value exists, and if we are using joints.
        this.inputQuantity = Math.floor(this.unitsConverted.unitOutPutQuantity / this.jointWeight)
        totalInputQuantity = this.inputQuantity * this.jointWeight
      }

      //verify the amount doesn't exceed avalible resources.
      if ( this.doesInputQuantityExcceedTotal(totalInputQuantity) ) { return 0 }

      //gets the summary of the remaining  packages.
      const remainingValue  = this.conversionService.getBaseUnitsConvertedTo(this.unitsConverted, this.baseUnitsRemaining, totalInputQuantity);
      // this.baseUnitsRemaining = remainingValue
      console.log('remainingValue', remainingValue)
      this.unitsConverted = this.conversionService.getAvailibleQuantityByUnitType(unitsConverted,this.jointWeight )


      if (unitsConverted) {
        unitsConverted.ouputRemainder  = remainingValue;
      }

      return remainingValue;

    } catch (error) {
      console.log(error)
    }
    return 0

  }

  getBaseUnitsRemaining() {

  }

  initPackageConversion() {

    if (!this.package) {
       console.log('package does not exist')
    }

    if (this.package) {
      this.unitsConverted                  = {} as IUnitsConverted
      this.unitsConverted.unitConvertTo    = {} as IUnitConversion
      this.unitsConverted.unitConvertFrom  = {} as IUnitConversion

      //'convert from converts the base to grams
      this.unitsConverted.unitConvertFrom  =  this.conversionService.getConversionItemByName('Grams')
      //convert to converts to the selected package
      this.unitsConverted.unitConvertTo    =  this.conversionService.getConversionItemByName(this.conversionName)

      if (this.unitsConverted.unitConvertTo ) {
        //multiply Input Quantity by JointWeight - if joint's aren't being used, set joints to = 1 so
        //we can continue to use jointWeight in all calculations.

        console.log('Pre Process',  this.jointWeight)
        if (this.unitsConverted.unitConvertTo.name.toLocaleLowerCase() != 'Joints') {
          if (this.jointWeight == 0) {
            this.jointWeight = 1;
          }
        } else {
          this.jointWeight = 1;
        }

        console.log('After Process',  this.jointWeight)

        this.unitsConverted.baseQuantity = this.baseUnitsRemaining; // this.unitsConverted.baseQuantity - ( this.inputQuantity * this.jointWeight)

        //returns unitConversion.ouputRemainder and unitConversion.ouputQuantity that tells us how many Joints We can use.
        this.unitsConverted  = this.conversionService.getAvailibleQuantityByUnitType(this.unitsConverted, this.jointWeight)

        // if (!this.unitsConverted.unitOutPutQuantity) {
        //   this.notifyEvent('No units converted', 'Alert')
        //   return
        // }

        if (this.baseUnitsRemaining == 0) {
          this.notifyEvent('No units remaining.', 'Alert')
          return
        }

        return this.unitsConverted
        this.notifyEvent('initPackageConversion Success.', 'Alert')

      }

    }
  }

  doesInputQuantityExcceedTotal(totalInputQuantity: number): boolean {
    if (totalInputQuantity > +this.baseUnitsRemaining)  {
      this.inputQuantity = 0;
      this.jointWeight   = 0;
      this.notifyEvent('The value you entered will exceed avalible packages. ', 'Alert');
      return true;
    }
    return false
  }

  //joints multiply by conversion rate. joinWeight should always equal 1 if jointWeight is not in use
  //converts units from provided value to desired sale value.
  jointsExceedAvalible(): boolean {


    if (this.inputQuantity && this.unitsConverted) {
      if (this.unitsConverted.unitOutPutQuantity == null ||
          this.unitsConverted.unitOutPutQuantity == undefined ||
          this.unitsConverted.unitOutPutQuantity == 0 ) {

        return false
      }

    }

    const requestedQuantity = this.jointWeight * this.inputQuantity;
    const remaining         = this.unitsConverted.unitOutPutQuantity;
    if (requestedQuantity == remaining) { return false; }

    if (requestedQuantity > remaining)  { return true;  }

    return false;

  }

  setNonConvertingFieldValues(inventoryAssignment: IInventoryAssignment): IInventoryAssignment {
    try {

      const f                                   =  this.f
      const index                               =  this.inventoryAssignments.length + 1
      this.inventoryLocation                    =  this.getLocationAssignment(this.inventoryLocationID);
      inventoryAssignment.sku                   =  this.generateSku(this.package.label, index);

      const cost =  numeral(+f.get('cost').value).format('0,0');
      this.cost = cost
      const price = numeral(+f.get('price').value).format('0,0');
      this.price = price

      try { inventoryAssignment.cost  = this.costValue   } catch (error) { }
      try { inventoryAssignment.price = this.priceValue  } catch (error) { }

      inventoryAssignment = this.inventoryAssignmentService.setNonConvertingFieldValues( inventoryAssignment ,this.facility, this.inventoryLocation,
                                                                                         this.intakeConversion, this.menuItem, this.package, )

      return inventoryAssignment
    }
     catch (error) {
    }
  }

  addInventoryAssignmentGroup() {

    let inventoryAssignment = {} as IInventoryAssignment

    if ( ! this.isValidEntry() )  { return }

    try {

        inventoryAssignment = this.setNonConvertingFieldValues(inventoryAssignment)

        const unitConversion =  this.conversionService.getConversionItemByName(this.conversionName)

        inventoryAssignment.unitConvertedtoName   = unitConversion.name
        inventoryAssignment.unitMulitplier        = unitConversion.value

        if (this.unitsConverted.unitConvertTo) {
          if (this.unitsConverted.unitConvertTo.name.toLowerCase() == 'joints') {


            const jointWeightValue = this.jointWeight;

            if ( this.jointsExceedAvalible() ) {
              this.notifyEvent('Quantity of Weight or Joints exceed remaining quantity.', 'Error')
              return
            }

            inventoryAssignment.jointWeight           = this.jointWeight
            inventoryAssignment.packageQuantity       = this.inputQuantity
            inventoryAssignment.packageCountRemaining = inventoryAssignment.packageQuantity
            inventoryAssignment.baseQuantityRemaining = this.inputQuantity * inventoryAssignment.unitMulitplier * this.jointWeight
            inventoryAssignment.baseQuantity          = inventoryAssignment.baseQuantityRemaining

          } else {

            inventoryAssignment.jointWeight           = this.jointWeight
            inventoryAssignment.packageQuantity       = this.inputQuantity
            inventoryAssignment.packageCountRemaining = inventoryAssignment.packageQuantity
            inventoryAssignment.baseQuantity          = this.inputQuantity * inventoryAssignment.unitMulitplier
            inventoryAssignment.baseQuantityRemaining = inventoryAssignment.baseQuantity
          }

          if (!this.inventoryAssignments) { this.inventoryAssignments = {} as IInventoryAssignment[]}
          this.inventoryAssignments.unshift(inventoryAssignment)
          this.unitOfMeasure = {} as IUnitConversion

          this.resetInventoryFormAssignmentValues();

        }
    } catch (error) {
      console.log('this function', error)
    }

  }

  addRemainingInventoryToAssignedGroup() {
    this.inputQuantity = this.unitsConverted.unitOutPutQuantity
    this.addInventoryAssignmentGroup();
    this.getAvailableUnits(false)
  }

  deleteAssignment(i: any) {
    this.inventoryAssignments.splice(i, 1)
    this.getAvailableUnits(false)
  }

  initPackageValues()  {
    this.conversionService.initPackageEntryForm(this.packageForm)
  }

  editAssignment(i: any) {
    const inv = this.inventoryAssignments[i];
    if (this.conversionService.editAssignment(inv, this.packageForm)) {
      this.refreshPackageEntryForm(inv, this.packageForm)
      this.inventoryAssignments.splice(i, 1)
    }
    this.getAvailableUnits(false)
  }

  initPackageEntryForm(form: FormGroup){
    form = this.fb.group({
      conversionName:                   [ ''],
      inputQuantity:                    [ ''], //[ Validators.required, Validators.pattern(/^-?(0|[1-9]\d*)?$/)] ],
      inventoryLocationID:              [ 0 ],
      cost:                             [ ''],
      price:                            [ ''],
      jointWeight:                      [ ''],
    })
    this.inputQuantity       = 0;
    this.inventoryLocationID = 0;
    this.price               = 0;
    this.cost                = 0;
  }

  refreshPackageEntryForm(inv: IInventoryAssignment, form: FormGroup){

    try {
      form = this.fb.group({
        conversionName:                   [ inv.unitConvertedtoName, Validators.required],
        inputQuantity:                    [ inv.packageQuantity,[ Validators.required, Validators.pattern(/^-?(0|[1-9]\d*)?$/)] ],
        inventoryLocationID:              [ inv.locationID, Validators.required],
        cost:                             [ inv.cost],
        price:                            [ inv.price],
        jointWeight:                      [ inv.jointWeight],
      })
      this.inputQuantity       = inv.packageQuantity
      this.inventoryLocationID = inv.locationID
      this.price               = inv.price;
      this.cost                = inv.cost
      this.conversionName      = inv.unitConvertedtoName

    } catch (error) {
      console.log(error)
    }
  }

  removeInventoryAssignment(i: number) {
    this.assignInventoryArray.removeAt(i)
    this.getAvailableUnits(false)
  }


  completePackageImport() {
    const site =  this.siteService.getAssignedSite();
    // okay so we have to add the list of inventory assignments to a list.
    const remaining = this.getAvailableUnits(false);

    if (remaining != 0) {
      this.notifyEvent(`Package not completed. There are ${remaining} gram(s) left.`, 'Entry required')
      return
    }

    const items = this.inventoryAssignments.forEach( item => {
      item.facilityLicenseNumber = this.facilityLicenseNumber
    })

    const inv$=  this.inventoryAssignmentService.addInventoryList(site, this.inventoryAssignments[0].label,
                                                                  this.inventoryAssignments)
    inv$.subscribe( data => {
      this.outoutClosePackage.emit('close')
      this.notifyEvent('Inventory Packages Imported', 'Success');
      }, error => {
        this.notifyEvent(`Inventory Packages failed: ${error}`, 'Failed');
      }
    )

  }

  validateQuantities() {
    if (!this.inputQuantity) {
      this.inputQuantity = 0
      //then we have to find out the input quantity based on the jointweight?
    }

    if (!this.jointWeight || this.jointWeight == 0)
    {
      //if we don't have a join weight or an input quantity then
      //we have just selected the conversion Name
      //so we don't have to calculate
      if (this.inputQuantity != 0 )
      {
        this.jointWeight = 1
      }
    }
  }

  isValidEntry(): boolean {

    if (!this.unitsConverted)   {
      this.notifyEvent_reset('UnitsConverted does not exist', 'Failure')
      return false
    }

    if (this.inputQuantity == 0 ) {
      this.notifyEvent_reset('Use a quantity.', 'Failure')
      return false
    }

    if (!this.menuItem) {
      this.notifyEvent_reset('Assocate a product with this package!', 'Failure')
      return false
    }

    const unitConversion =  this.conversionService.getConversionItemByName(this.conversionName)

    if (!unitConversion) {
      this.notifyEvent_reset('Failed to convert item', 'Failure')
      return false
    }

    if (!this.conversionName) {
      this.notifyEvent_reset('Conversion value does not exist!', 'Failure')
      return false
    }

    const x = this.inputQuantity;
    const y = this.unitsConverted.unitOutPutQuantity;
    const n = y - x

    if ( +n == +0 ) {
      this.notifyEvent_reset('No More to package.', 'Alert')
      this.baseUnitsRemaining = 0
    }

    if (  +x > +y  ) {
      this.notifyEvent_reset('Use a smaller quantity.', 'Alert')
      return false
    }

    if (!this.unitsConverted.unitConvertTo)   {
      this.notifyEvent_reset('UnitConvertTo does not exist', 'Failure')
      return false
    }

    return true
  }

  //pairs with 'isValidEntry
  notifyEvent_reset(note, note2) {
    this.notifyEvent(note, note2)
    this.refreshResultsAfterSelection();
  }

  resetInventoryFormAssignmentValues() {
    console.log('resetInventoryFormAssignmentValues - ran')
    this.inputQuantity  = '';
    this.inventoryLocationID = 0;
    this.conversionName = ''
    this.cost           = 0;
    this.price          = 0;
    this.jointWeight    = 0;
    // this.getAvailableUnitsByConversion('Grams')

    this.baseUnitsRemaining = this.getAvailableUnits(false);

    if (this.unitsConverted) {
      this.unitsConverted.unitOutPutQuantity = 0
      this.unitsConverted.ouputRemainder     = 0
    }

  }

  refreshResultsAfterSelection() {
    // this.getAvailableUnitsByConversion('Grams');
    this.baseUnitsRemaining = this.getAvailableUnits(false);
    this.unitsRemaining = this.getAvailableUnitsByInputQuantity(null)
  }

  convertCurrencyToValue(value: any): number {
    if (value) {
      value = value.replace(/\d(?=(\d{3})+\.)/g, '$&,')
      return +value
    }
  }

  transformAmount(element){
    if (this.cost) {
      this.costValue = this.cost
      this.cost = this.currencyPipe.transform(this.cost, '$');
      element.target.value = this.cost;
    }
  }

  transformPriceAmount(element){
    if (this.price) {
      this.priceValue = this.price
      this.price = this.currencyPipe.transform(this.price, '$');
      element.target.value = this.price;
    }
  }

  notifyEvent(message: string, action: string) {
    this._snackBar.open(message, action, {
      duration: 2000,
      verticalPosition: 'top'
    });
  }

}
