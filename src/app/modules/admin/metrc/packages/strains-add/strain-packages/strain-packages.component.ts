import { Component,   Input,  OnInit,  Output, EventEmitter} from '@angular/core';
import { ActivatedRoute,  } from '@angular/router';
import { UntypedFormBuilder, UntypedFormGroup, Validators, UntypedFormArray, UntypedFormControl} from '@angular/forms';
import { MatLegacySnackBar as MatSnackBar } from '@angular/material/legacy-snack-bar';
import { Observable, of, switchMap,  } from 'rxjs';
import * as numeral from 'numeral';
import { IItemFacilitiyBasic } from 'src/app/_services/metrc/metrc-facilities.service';
import { InventoryLocationsService, IInventoryLocation } from 'src/app/_services/inventory/inventory-locations.service';
import { InventoryAssignmentService, IInventoryAssignment,  } from 'src/app/_services/inventory/inventory-assignment.service';
import { IMenuItem } from 'src/app/_interfaces/menu/menu-products';
import { MetrcPackagesService } from 'src/app/_services/metrc/metrc-packages.service';
import { METRCPackage } from 'src/app/_interfaces/metrcs/packages';
import { SitesService } from 'src/app/_services/reporting/sites.service';
import { ConversionsService, IUnitConversion, IUnitsConverted } from 'src/app/_services/measurement/conversions.service';
import { ReversePipe } from 'ngx-pipes';
import { UserPreferences } from 'src/app/_interfaces/people/users';
import { AuthenticationService } from 'src/app/_services';

@Component({
  selector: 'app-strain-packages',
  templateUrl: './strain-packages.component.html',
  styleUrls: ['./strain-packages.component.scss'],
  providers: [ReversePipe]
})

export class StrainPackagesComponent implements OnInit {
  action$: Observable<any>
  get _jointWeightValue() {return this.packageForm.get("jointWeightValue") as UntypedFormControl;}
  @Output()outputPackage         : EventEmitter<any> = new EventEmitter();
  @Output()outoutClosePackage    : EventEmitter<any> = new EventEmitter();
  @Input() package               : METRCPackage;
  @Input() menuItem              : IMenuItem;
  @Input() packageForm           : UntypedFormGroup;
  @Input() priceForm     :         UntypedFormGroup;
  @Input() facility              = {} as IItemFacilitiyBasic
  @Input() facilityLicenseNumber : string;
  @Input() saved: boolean;
  inventoryLocationID            : number ;

  get f():                UntypedFormGroup  { return this.packageForm as UntypedFormGroup};

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

  unitsOfMeasure =          this.conversionService.getGramsConversions();
  unitOfMeasure:            IUnitConversion;
  intakeConversion        : IUnitConversion;
  intakeconversionQuantity: number;

  inventoryAssignments:    IInventoryAssignment[];
  inventoryLocations$:     Observable<IInventoryLocation[]>;
  inventoryLocations:      IInventoryLocation[];
  inventoryLocation:       IInventoryLocation;

  get assignInventoryArray(): UntypedFormArray { return this.packageForm.get('assignInventoryArray') as UntypedFormArray}

  processUnitCount       = true;
  processJointWeight     = true;
  processUnitConversion  = true;

  showJSONData: boolean;

  get userPref() {
    if (this.authenticationService._user.value) {
      const user = this.authenticationService._user.value;
      if (user) {
        const pref = this.authenticationService._user.value.preferences;
        
        const userPref = this.authenticationService._user.value.userPreferences
        if (userPref) { 
          return userPref;
        }
        if (!pref) { 
          console.log('error pref', pref, this.authenticationService._user.value)
          const preferences = {} as UserPreferences;
          return preferences;
        }
        try { 
          const preferences = JSON.parse(pref) as UserPreferences;
          return preferences;
        } catch(error) { 
          console.log('error pref', pref, this.authenticationService._user.value)
        }
        const preferences = {} as UserPreferences;
        return preferences;
      }
    }
    return {} as UserPreferences;
  }
  constructor(
    private conversionService: ConversionsService,
    public  route: ActivatedRoute,
    public  fb: UntypedFormBuilder,
    private _snackBar: MatSnackBar,
    private siteService: SitesService,
    private authenticationService: AuthenticationService,
    private metrcPackagesService: MetrcPackagesService,
    private inventoryLocationsService: InventoryLocationsService,
    private inventoryAssignmentService: InventoryAssignmentService,
    )
  {
  }

    ngOnInit() {

      this.conversions =   this.conversionService.getGramsConversions();
      this.unitsConverted = {} as IUnitsConverted;
      this.inventoryAssignments = [];
      this.inventoryLocations$ =  this.setInventoryLocation()
      this.intakeConversion =  this.getUnitConversionToGrams(this.package.unitOfMeasureName);
      this.intakeconversionQuantity = this.intakeConversion.value * this.package.quantity
      this.baseUnitsRemaining = this.intakeconversionQuantity
      this.initialQuantity = this.intakeconversionQuantity
      this.setDefaultIntakeUnit()
      
    }

    setDefaultIntakeUnit() {
      this.getAvailableUnitsByConversion('Grams')
      this.inputQuantity = this.package?.quantity;

      const item =  { inputQuantity : this.package?.quantity}
      // this.packageForm.patchValue{ item }
      this.packageForm.patchValue(item)
    }
    
    setInventoryLocation() {
      return  this.inventoryLocationsService.getLocations().pipe(switchMap(data => {
        this.inventoryLocations = data
        if (data) {
          data.forEach(item => {
            if (item.defaultLocation) {
              this.getLocationAssignment(item.id);
              this.inventoryLocationID = item.id;
              this.packageForm.patchValue({inventoryLocationID: item.id})
            }
          });
        }
        return of(data)
      }))
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

    if (this.userPref?.metrcUseMetrcLabel) {
      return this.package?.label;
    }
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


    if (!event) { return }

    this.conversionName = event;

    this.processFields(true, true, false)

    return this.getAvailableUnits(false)

  }

  getQuantityByJointCount(event) {

    if (!event) { return };

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
    this.baseUnitsRemaining = this.inventoryAssignmentService.getSummaryOfGramsUsed( site, this.inventoryAssignments, this.initialQuantity );
    this.validateQuantities();
    let unitsConverted = this.initPackageConversion();
    if ( this.jointWeight == 0 ) { this.jointWeight = 1}
    let totalInputQuantity =  0;
    try {

    
      if (unitsConverted?.unitConvertTo?.value) {
        totalInputQuantity = this.jointWeight * this.inputQuantity * unitsConverted.unitConvertTo.value;
      }

      if (!usingJointsField) {
        if ( totalInputQuantity == 0 )  { return totalInputQuantity};
      }
     
      if (usingJointsField) {
        if (this.unitsConverted?.unitOutPutQuantity) {
          this.inputQuantity = Math.floor(this.unitsConverted?.unitOutPutQuantity / this.jointWeight)
          totalInputQuantity = this.inputQuantity * this.jointWeight
        }
      }
      //verify the amount doesn't exceed avalible resources.
      if ( this.doesInputQuantityExcceedTotal(totalInputQuantity) ) { return 0 }
      //gets the summary of the remaining  packages.
      const remainingValue  = this.conversionService.getBaseUnitsConvertedTo(this.unitsConverted, this.baseUnitsRemaining, totalInputQuantity);
    
      unitsConverted = this.conversionService.getAvailibleQuantityByUnitType(unitsConverted,this.jointWeight )

      if (unitsConverted) {
        unitsConverted.ouputRemainder  = remainingValue;
        this.unitsConverted = unitsConverted
      }

      return remainingValue;
    } catch (error) {
      console.log(error)
    }
    return 0

  }

  getBaseUnitsRemaining() {
  }

  get isPackageReady() {
    //
    // const batchNumber = this.package.productionBatchNumber
    // const batchNumber = this.package.packagedDate;

    // if (this.saved) {
      // const inv = this.packageForm.value as IInventoryAssignment
      // if ( inv.productionBatchNumber  ) {
      //     return true;
      // }

      // if (inv.batchDate &&
      //     inv.productionBatchNumber &&
      //     inv.testDate) {
      //       return true;
      //     }
      // }

    return true
  }

  initPackageConversion() {
    if (!this.package) {   console.log('package does not exist') }
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
        // console.log('Pre Process',  this.jointWeight)
        if (this.unitsConverted.unitConvertTo.name.toLocaleLowerCase() != 'Joints') {
          if (this.jointWeight == 0) {
            this.jointWeight = 1;
          }
        } else {
          this.jointWeight = 1;
        }
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
    this.baseUnitsRemaining = +this.baseUnitsRemaining.toFixed(2)
    totalInputQuantity      = +totalInputQuantity.toFixed(2)
    // console.log('doesInputQuantityExcceedTotal', totalInputQuantity.toFixed(2) , )
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
    return this.conversionService.jointsExceedAvalible(this.jointWeight, this.inputQuantity, this.unitsConverted)
  }

  setNonConvertingFieldValues(inventoryAssignment: IInventoryAssignment): IInventoryAssignment {
      try {
        const f                                   =  this.f

        const index                               =  this.inventoryAssignments.length + 1

        this.inventoryLocation                    =  this.getLocationAssignment(this.inventoryLocationID);
        
        inventoryAssignment.sku                   =  this.generateSku(this.package?.label, index);

        console.log('pricecostvalues',inventoryAssignment, f.value);

        const cost  =  numeral(+f.get('cost').value).format('0,0');
        this.cost   = cost
        const price = numeral(+f.get('price').value).format('0,0');
        this.price  = price

        console.log('pricecostvalues', f.value);
        
        inventoryAssignment.cost = +cost;
        inventoryAssignment.price = +price;

        const itemPackage = this.packageForm.value;
        inventoryAssignment.facilityLicenseNumber = itemPackage?.facilityLicenseNumber
        inventoryAssignment.facilityLicenseName = itemPackage?.facilityLicenseName
        inventoryAssignment.labFacilityLicenseNumber = itemPackage?.facilityLicenseNumber
        inventoryAssignment.sourceHarvestName  = itemPackage?.sourceHarvestName
        inventoryAssignment.sourceHarvestNumber  = itemPackage.sourceHarvestNumber

        inventoryAssignment.facilityLicenseName = itemPackage?.facilityLicenseName
        
        inventoryAssignment.cbd = +itemPackage?.cbd;
        inventoryAssignment.thc = +itemPackage?.tch;
        inventoryAssignment.thc = +itemPackage?.thca;
        

        inventoryAssignment = this.inventoryAssignmentService.setNonConvertingFieldValues(
                            inventoryAssignment ,this.facility, this.inventoryLocation,
                            this.intakeConversion, this.menuItem, this.package, )
                  }
      catch (error) {
        console.log('error', error)
      }
  
      return inventoryAssignment
  }

  getPriceValues(item: IInventoryAssignment) {
    if (this.priceForm && item) {
      const priceCategoryID = this.priceForm.controls['priceCategoryID'].value;
      const cost = this.priceForm.controls['cost'].value;
      const price  = this.priceForm.controls['price'].value;
      item.priceCategoryID = priceCategoryID;
      item.cost = cost;
      item.price = price
    }
    return item;
  }


  addInventoryAssignmentGroup() {
    let inventoryAssignment = {} as IInventoryAssignment
    if ( ! this.isValidEntry() )  { return }
    try {
      
      inventoryAssignment                       = this.getPriceValues(inventoryAssignment);
      inventoryAssignment                       = this.setNonConvertingFieldValues(inventoryAssignment);
      console.log('getPriceValues 1', inventoryAssignment)

      const unitConversion                      = this.conversionService.getConversionItemByName(this.conversionName);
    
      if (!inventoryAssignment) {  
        this.siteService.notify('No Item assigned', 'close', 5000)  
        return
      }

      inventoryAssignment.unitConvertedtoName   = unitConversion?.name;
      inventoryAssignment.unitMulitplier        = unitConversion?.value;
      
      if (this.unitsConverted.unitConvertTo) {
        inventoryAssignment = this.conversionService.getConversionQuantities(inventoryAssignment, this.unitsConverted, this.inputQuantity, this.jointWeight)
        // console.log('addInventoryAssignmentGroup 2', inventoryAssignment)
      
        if (!this.inventoryAssignments) { this.inventoryAssignments = {} as IInventoryAssignment[]}
        this.inventoryAssignments.unshift(inventoryAssignment);
        this.unitOfMeasure = {} as IUnitConversion;
        this.resetInventoryFormAssignmentValues();
      }
    } catch (error) {
      console.log('this function', error)
    }
    return inventoryAssignment;
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

  initPackageEntryForm(form: UntypedFormGroup){


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

  refreshPackageEntryForm(inv: IInventoryAssignment, form: UntypedFormGroup){
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
   
    const packageItem = this.packageForm.value;
    
    this.inventoryAssignments.forEach((assignment, index) => {
      assignment.thc  = packageItem?.thc;
      assignment.thca = packageItem?.thca;
      assignment.cbd  = packageItem?.cbd;

      assignment.labFacilityName          = packageItem?.labFacilityName;
      assignment.labFacilityLicenseNumber = packageItem?.labFacilityLicenseNumber;
      assignment.sourceHarvestName        = packageItem?.sourceHarvestName;
      assignment.sourceHarvestNumber      = packageItem?.sourceHarvestNumber;
      assignment.facilityLicenseName      = packageItem?.facilityLicenseName;
      assignment.facilityLicenseNumber    = packageItem?.facilityLicenseNumber;

      assignment.initialLabTestingState = packageItem?.initialLabTestingState;
      assignment.itemFromFacilityLicenseNumber = packageItem?.itemFromFacilityLicenseNumber;
      assignment.itemFromFacilityName = packageItem?.itemFromFacilityName;
      assignment.receivedFromFacilityName = packageItem?.receivedFromFacilityName;
      assignment.receivedFromFacilityLicenseNumber = packageItem?.receivedFromFacilityLicenseNumber;
      assignment.receivedDateTime = packageItem?.receivedDateTime;
      assignment.packagedDate = packageItem?.packagedDate;
      assignment.packageType =  packageItem?.packageType;
      assignment.metrcItemID = packageItem?.metrcItemID;
      assignment.labTestingStateDate =  packageItem.labTestingStateDate;
      assignment.labTestingPerformedDate =  packageItem.labTestingStateDate;
      assignment.labTestingState =  packageItem.labTestingState;
      assignment.labFacilityName =  packageItem.labFacilityName;
      assignment.labFacilityLicenseNumber =  packageItem?.labFacilityLicenseNumber;
      assignment.json        =  packageItem.json;
      assignment.jointWeight =  packageItem.jointWeight;

    });
  

    const inv$=  this.inventoryAssignmentService.addInventoryList(site, 
                                                                  this.inventoryAssignments[0].label,
                                                                  this.inventoryAssignments)
    this.action$ = inv$.pipe(
      switchMap(data => {
        this.outoutClosePackage.emit('close')
       
        this.siteService.notify('Inventory Packages Imported', 'Success', 2000, 'green');
        if (this.userPref?.metrcUseMetrcLabel) {
          if (data) {
            const item = data[0]
            const dialogRef = this.inventoryAssignmentService.openInventoryItem(data[0].id)
          }
          return of(data)
        }

        return of(data)
      }
    ))
  }

  getPackageData() {
    //we can get this from the form
    this.packageForm.value as IInventoryAssignment;
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
      if (this.inputQuantity != 0 ) { this.jointWeight = 1 }
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
    // console.log('x', x)
    // console.log('this.unitsConverted.unitOutPutQuantity', this.unitsConverted.unitOutPutQuantity)

    if ( +n == +0 ) {
      //friendly message not a restriction.
      this.notifyEvent_reset('No More to package.', 'Alert')
      this.baseUnitsRemaining = 0
    }

    if ( !x  ) {
      this.notifyEvent_reset(`No input quantity. `, 'Alert')
      return  false
    }

    if ( !y  ) {
      this.notifyEvent_reset(`No unit out put quantity. `, 'Alert')
      return  false
    }

    if (!this.unitsConverted.unitConvertTo)   {
      this.notifyEvent_reset('UnitConvertTo does not exist', 'Failure')
      return false
    }

    const convertToName = this.unitsConverted.unitConvertTo.name.toLocaleLowerCase()
    if (convertToName == 'joints') {
      const totalQuantity = +(this.jointWeight * this.inputQuantity).toFixed(2)
        // if (totalQuantity > x ) {
        // this.notifyEvent_reset(`Values Input: ${x} Used: ${totalQuantity} `, 'Alert')
        return true
      // }
    }

    if (  convertToName != 'joints' && (x > +y)  ) {
      this.notifyEvent_reset(`Use a smaller quantity. Input: ${x} Used: ${y} `, 'Alert')
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
    this.inputQuantity  = '';
    this.inventoryLocationID = 0;
    this.conversionName = ''
    this.cost           = 0;
    this.price          = 0;
    this.jointWeight    = 0;
    this.baseUnitsRemaining = this.getAvailableUnits(false);
    if (this.unitsConverted) {
      this.unitsConverted.unitOutPutQuantity = 0
      this.unitsConverted.ouputRemainder     = 0
    }
  }

  refreshResultsAfterSelection() {
    this.baseUnitsRemaining = this.getAvailableUnits(false);
    this.unitsRemaining = this.getAvailableUnitsByInputQuantity(null)
  }

  convertCurrencyToValue(value: any): number {
    if (value) {
      value = value.replace(/\d(?=(\d{3})+\.)/g, '$&,')
      return +value
    }
  }

  // transformAmount(element){
  //   if (this.cost) {
  //     this.costValue       = this.cost
  //     this.cost            = this.currencyPipe.transform(this.cost, '$');
  //     element.target.value = this.cost;
  //   }
  // }

  // transformPriceAmount(element){
  //   if (this.price) {
  //     this.priceValue      = this.price
  //     this.price           = this.currencyPipe.transform(this.price, '$');
  //     element.target.value = this.price;
  //   }
  // }

  notifyEvent(message: string, action: string) {
    this._snackBar.open(message, action, {
      duration: 2000,
      verticalPosition: 'top'
    });
  }

}
