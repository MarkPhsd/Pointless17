import { Injectable } from '@angular/core';
import { UntypedFormBuilder, UntypedFormGroup, UntypedFormArray } from '@angular/forms';
import { IPriceSchedule, DateFrame, TimeFrame, OrderType, DiscountInfo  } from '../_interfaces/menu/price-schedule';
import { DatePipe } from '@angular/common';
import { PriceScheduleDataService } from '../_services/menu/price-schedule-data.service';

// dateFrames:         DateFrame[];
// weekDays:           WeekDay[];
// clientTypes:        ClientType[];
// orderTypes:         OrderType[];
// timeFrames:         TimeFrame[];
// requiredItemTypes:  RequiredItemType[];
// requiredCategories: DiscountInfo[];
// requiredItems:      DiscountInfo[];
// brandDiscounts:     DiscountInfo[];
// categoryDiscounts:  DiscountInfo[];
// itemDiscounts:      DiscountInfo[];
// itemTypeDiscounts:  DiscountInfo[];
// requiredBrands:     DiscountInfo[];

@Injectable({
  providedIn: 'root'
})

export class FbPriceScheduleService {


  constructor(private fb: UntypedFormBuilder,
             private datePipe: DatePipe,
              private priceScheduledataService: PriceScheduleDataService,
      ) { }

  getFormValue(item: IPriceSchedule, inputForm: UntypedFormGroup): IPriceSchedule {

    if (inputForm.valid) {
      item = inputForm.value;
    }
    //then we go through each array, and add values to it.

    return item
  }

  setValues(item: IPriceSchedule, inputForm: UntypedFormGroup): UntypedFormGroup {

    if (inputForm.valid) {
      inputForm.patchValue(item);
      this.priceScheduledataService.updatePriceSchedule(item)
    }
    //then we go through each array, and add values to it.

    return inputForm
  }


  initSearchForm(form: UntypedFormGroup) {
    form = this.fb.group( {
      itemName        : [''],//  [this.itemName],
      allDates        : [''],//  [this.allDates],
      allEligible     : [''],//  [this.allEligible],
      allOrderTypes   : [''],//  [this.allOrderTypes],
      allWeekdaysDays : [''],//  [this.allWeekdaysDays],
      timeFrameAlways : [''],//  [this.timeFrameAlways],
      active          : [''],//  [this.active],
      type            : [''],//  [this.type],
    });
    return form

  }
  // ClientType, IPriceSchedule, WeekDay , DateFrame, TimeFrame, OrderType, DiscountOption
  initForm(inputForm: UntypedFormGroup): UntypedFormGroup {
    inputForm = this.fb.group({
      id             : [''],
      allEligible:     [true],
      allOrderTypes:   [true],
      allWeekdaysDays: [true],
      timeFrameAlways: [true],
      allDates:        [true],
      active:          [true],
      name:            [''],
      lastEdited:      [''],
      created:         [''],
      type:            [''],
      value:           [''],
      enabled:         [true],
      image:           [],
      description    : [],

      showMetaTags: [],
      showCBD     : [],
      showTCH     : [],
      showProof   : [],
      showABV     : [],
      showGlueten : [],
      showImage   : [],
      showDescription : [],
      showShortDescription: [],
      showInfo    : [],
      title       : [],
      subTitle    : [],
      showAddress : [],
      autoApplyRewards: [],
      allItems    : [],
      orderTotal  : [],

      orderTypes:           this.fb.array([ ]),
      clientTypes:          this.fb.array([ ]),
      weekDays:             this.fb.array([ ]),
      dateFrames:           this.fb.array([ ]),
      timeFrames:           this.fb.array([ ]),
      requiredItemTypes:    this.fb.array([ ]),
      requiredCategories:   this.fb.array([ ]),
      requiredBrands:       this.fb.array([ ]),
      requiredItems:        this.fb.array([ ]),
      brandDiscounts:       this.fb.array([ ]),
      categoryDiscounts:    this.fb.array([ ]),
      itemDiscounts:        this.fb.array([ ]),
      itemTypeDiscounts:    this.fb.array([ ]),
     }
    )
    return inputForm
  }

  initNewClientType() {

  }

  setClientTypeValues(inputForm: UntypedFormGroup, items: any) {
    this.setArrayValue(inputForm, items, 'clientTypes', 'clientTypeID')
    this.priceScheduledataService.updatePriceSchedule(inputForm.value)
  }
  setOrderTypeValues(inputForm: UntypedFormGroup, items: any) {
    this.setArrayValue(inputForm, items, 'orderTypes', 'orderTypeID')
    this.priceScheduledataService.updatePriceSchedule(inputForm.value)
  }

  //set fields
  setValue(inputForm: UntypedFormGroup, fieldName: string, value: any) {
    inputForm.setValue({
      fieldName: value
    });
    this.priceScheduledataService.updatePriceSchedule(inputForm.value)
  }

  setArrayValue(inputForm: UntypedFormGroup, items: any, controlName: string, itemName: string) {
    if (!inputForm) { return }
    if (items) {
      try {
        const control = inputForm.get(controlName) as UntypedFormArray;
        if (!control)   { return }
        if (control) {
          control.clear();
          items.forEach( data =>  {

            if (itemName === 'clientTypeID') {
              control.push(this.fb.control({
                clientTypeID: data,
                name:         data.name,
               }))
            }

            if (itemName === 'orderTypeID') {
              control.push(this.fb.control({
                orderTypeID: data,
                name:        data.name
               }))
            }

            if (itemName === 'name') {
              control.push(this.fb.control({ name: data }))
            }
          })
        }
      } catch (error) {
        console.log(error)
      }
    }
    this.priceScheduledataService.updatePriceSchedule(inputForm.value)
  }

  initFormData(inputForm: UntypedFormGroup, priceSchedule: IPriceSchedule) {

    inputForm.patchValue(priceSchedule)
    this.updateDiscountInfos(inputForm, priceSchedule)
    this.addDateRanges(inputForm, priceSchedule.dateFrames)
    this.addOrderTypes(inputForm, priceSchedule.orderTypes)
    this.addClientTypes(inputForm, priceSchedule.clientTypes)
    this.addTimeRanges(inputForm, priceSchedule.timeFrames)
    this.setWeekDayArray(inputForm, priceSchedule.weekDays)
    this.priceScheduledataService.updatePriceSchedule(inputForm.value)

  }

  updateDiscountInfos(inputForm: UntypedFormGroup, priceSchedule: IPriceSchedule) {
    this.addRequiredBrands(inputForm, priceSchedule.requiredBrands)
    this.addRequiredCategories(inputForm, priceSchedule.requiredCategories)
    this.addRequiredItemTypes(inputForm, priceSchedule.requiredItemTypes)
    this.addRequiredItems(inputForm, priceSchedule.requiredItems)

    this.addDiscountBrands(inputForm, priceSchedule.brandDiscounts)
    this.addDiscountItems(inputForm, priceSchedule.itemDiscounts)
    this.addDiscountItemTypes(inputForm, priceSchedule.itemTypeDiscounts)
    this.addDiscountCategories(inputForm, priceSchedule.categoryDiscounts)
  }


  addDiscountCategories(inputForm: UntypedFormGroup, info: DiscountInfo[]) {
    this.setDiscountInfoValues( inputForm, info, 'categoryDiscounts' )
  }
  addDiscountItemTypes(inputForm: UntypedFormGroup, info: DiscountInfo[]) {
    this.setDiscountInfoValues(inputForm, info, "itemTypeDiscounts")
  }
  addDiscountItems(inputForm: UntypedFormGroup, info: DiscountInfo[]) {
    this.setDiscountInfoValues(inputForm, info, "itemDiscounts")
  }
  addDiscountBrands(inputForm: UntypedFormGroup, info: DiscountInfo[]) {
    this.setDiscountInfoValues(inputForm, info,  "brandDiscounts")
  }

  addRequiredCategories(inputForm: UntypedFormGroup, info: DiscountInfo[]) {
    this.setDiscountInfoValues( inputForm, info, 'requiredCategories' )
  }
  addRequiredItemTypes(inputForm: UntypedFormGroup, info: DiscountInfo[]) {
    this.setDiscountInfoValues(inputForm, info,  "requiredItemTypes")
  }
  addRequiredItems(inputForm: UntypedFormGroup, info: DiscountInfo[]) {
    this.setDiscountInfoValues(inputForm, info, "requiredItems")
  }
  addRequiredBrands(inputForm: UntypedFormGroup, info: DiscountInfo[]) {
    this.setDiscountInfoValues(inputForm, info ,  "requiredBrands")
  }

  setDiscountInfoValues(inputForm: UntypedFormGroup, items: DiscountInfo[], formArrayName: string) {
    if (!inputForm) { return }
    if (items) {
      try {
        const control = inputForm.get(formArrayName) as UntypedFormArray;
        if (!control)  { return }
        if (control) { control.clear(); }

        items.forEach( info =>  {
          control.push(this.fb.group({
            id:         [info.id],
            value:      [info.value],
            quantity:   [info.quantity],
            itemID:     [info.itemID],
            name:       [info.name],
            sort:       [info.sort],
            andOr:      [info.andOr],
          }))
        })
      } catch (error) {
        console.log(error)
      }
    }
  }

  addArray(inputForm, controlName: string, array: any[]) {
    if (!inputForm) { return }
    try {
      const control = inputForm.get(controlName) as UntypedFormArray;
      control.clear()
      array.forEach( data =>  {
        control.push(this.fb.control(data))
      })
    } catch (error) {
      console.log(error)
    }

    this.priceScheduledataService.updatePriceSchedule(inputForm.value)
  }

  addDiscountCategory(inputForm: UntypedFormGroup, info: DiscountInfo) {
    this.addDiscountInfo(inputForm, info, "categoryDiscounts")
  }
  addDiscountItemType(inputForm: UntypedFormGroup, info: DiscountInfo) {
    this.addDiscountInfo(inputForm, info, "itemTypeDiscounts")
  }
  addDiscountItem(inputForm: UntypedFormGroup, info: DiscountInfo) {
    this.addDiscountInfo(inputForm, info, "itemDiscounts")
  }
  addDiscountBrand(inputForm: UntypedFormGroup, info: DiscountInfo) {
    this.addDiscountInfo(inputForm, info, "brandDiscounts")
  }
  addRequiredCategory(inputForm: UntypedFormGroup, info: DiscountInfo) {
    this.addDiscountInfo(inputForm, info, "requiredCategories")
  }
  addRequiredItemType(inputForm: UntypedFormGroup, info: DiscountInfo) {
    this.addDiscountInfo(inputForm, info, "requiredItemTypes")
  }
  addRequiredItem(inputForm: UntypedFormGroup, info: DiscountInfo) {
    this.addDiscountInfo(inputForm, info, "requiredItems")
  }
  addRequiredBrand(inputForm: UntypedFormGroup, info: DiscountInfo) {
    this.addDiscountInfo(inputForm, info, "requiredBrands")
  }

  addDiscountInfo(inputForm: UntypedFormGroup, info: DiscountInfo, controlName: string) {

    if (!inputForm) { return }
    const control = inputForm.get(controlName) as UntypedFormArray;
    if (!control)  { return }

    if (info) {
      control.push(this.fb.group({
        id:         info.id,
        value:      [info.value],
        quantity:   [info.quantity],
        itemID:     info.itemID,
        name:       info.name,
        sort:       [info.sort],
        andOr:      [info.andOr],
      }))
      return
    }

    control.push(this.fb.group({
      id:         '',
      value:      '',
      quantity:   '0',
      itemID:     '',
      name:       '',
      andOr     : '',
      sort:       [info.sort],
    }))

  }

  // addClientType(inputForm: FormGroup, clientType: ClientTypes) {
  //   if (!inputForm) { return }
  //   const control = inputForm.get('clientTypes') as FormArray;
  //   if (!control)   { return }
  //   control.push(this.fb.control(clientType))
  //   this.priceScheduledataService.updatePriceSchedule(inputForm.value)
  // }


  addClientTypes(inputForm: UntypedFormGroup, items: any[]) {
    // this.addArray(inputForm, 'clientTypes', clientTypes)

    if (!inputForm) { return }
    const control = inputForm.get('clientTypes') as UntypedFormArray;
    if (!control)  { return }
    if (control) { control.clear(); }
    if (items) {
      items.forEach( info =>  {
          control.push(this.fb.group({
            clientTypeID:  [info.clientTypeID], //    number;
            name:          [info.name]
          }))
        }
      )
      return
    }

    this.priceScheduledataService.updatePriceSchedule(inputForm.value)
  }

  addOrderTypes(inputForm: UntypedFormGroup, items: OrderType[]) {
    // this.addArray(inputForm, 'clientTypes', clientTypes)

    if (!inputForm) { return }
    const control = inputForm.get('orderTypes') as UntypedFormArray;
    if (!control)  { return }
    control.clear()
    if (!items) { return }
    if (items) {
      items.forEach( info =>  {
          control.push(this.fb.group({
            orderTypeID:   [info.orderTypeID], //    number;
            name:          [info.name]
          }))
        }
      )
      return
    }

    this.priceScheduledataService.updatePriceSchedule(inputForm.value)
  }

  addTimeRanges(inputForm: UntypedFormGroup, items: TimeFrame[]) {
    try {
      if (!inputForm) { return }
      const control = inputForm.get('timeFrames') as UntypedFormArray;
      if (!control)   { return }
      control.clear()
      if (!items) { return }
      items.forEach( info =>  {
        const pipe = new DatePipe('en-US');
        // const startTime =  this.datePipe.transform(info.startTime, 'HH:mm');
        // const endTime   =  this.datePipe.transform(info.endTime, 'HH:mm');
        control.push(this.fb.group({
          startTime: [this.datePipe.transform(info.startTime, 'HH:mm')],  //this.datePipe.transform(info.startTime, 'shortTime') ],
          endTime:   [pipe.transform(info.endTime, 'HH:mm') ]//  [endTime] ,// this.datePipe.transform(info.endTime, 'shortTime') ]
        }))
      })
    } catch (error) {
      console.log(error)
    }
    this.priceScheduledataService.updatePriceSchedule(inputForm.value)
  }


  addDateRanges(inputForm: UntypedFormGroup, items: DateFrame[]) {
    try {
      if (!inputForm) { return }
      const control = inputForm.get('dateFrames') as UntypedFormArray;
      if (!control)   { return }
      control.clear()
      if (!items) { return }
      const pipe = new DatePipe('en-US');
      items.forEach( info =>  {
        control.push(this.fb.group({
          startDate:  [pipe.transform(info.startDate, 'MM/dd/yyyy')],
          endDate:    [pipe.transform(info.endDate, 'MM/dd/yyyy') ]
        }))
      })

    } catch (error) {
      console.log(error)
    }

    this.priceScheduledataService.updatePriceSchedule(inputForm.value)
  }

  // WeekDay[]
  setWeekDayArray(inputForm: UntypedFormGroup, items: any[]) {
    //clean this up later, not too much importance, but could be more reduced.
    // this.setArrayValue(inputForm, items, 'weekDays', 'name')
    if (!inputForm) { return }
    try {
      const control = inputForm.get('weekDays') as UntypedFormArray;
      if (!control)   { return }
      control.clear();
      if (!items) { return }
      items.forEach( data =>  {
        control.push(this.fb.control({
            name: data.name
          }
        ))
      })
    } catch (error) {
      console.log(error)
    }

    this.priceScheduledataService.updatePriceSchedule(inputForm.value)
  }

  addTimeRange(inputForm: UntypedFormGroup, timeFrame: TimeFrame) {
    if (!inputForm) { return }
    const control = inputForm.get('timeFrames') as UntypedFormArray;
    if (!control)   { return }

    control.push(this.fb.group({
      startTime: '',
      endTime:   ''
    }))

    this.priceScheduledataService.updatePriceSchedule(inputForm.value)
  }

  addDateRange(inputForm: UntypedFormGroup, dateFrame: DateFrame) {
    try {
      if (!inputForm) { return }
      const control  = inputForm.get('dateFrames') as UntypedFormArray;
      if (!control)   { return }
      const pipe = new DatePipe('en-US');
      if (dateFrame){
        control.push(this.fb.group({
          startDate:  [pipe.transform(dateFrame.startDate, 'MM/dd/yyyy')],
          endDate:    [pipe.transform(dateFrame.endDate, 'MM/dd/yyyy')]
        }))
        return
      }
      control.push(this.fb.group({
        startDate: '',
        endDate:   ''
      }))
    } catch (error) {
      console.log(error)
    }

    this.priceScheduledataService.updatePriceSchedule(inputForm.value)
  }

  createTimeRange( ) {
    return this.fb.control({
      startTime: '',
      endTime:   ''
    })
  }

  createDateRange( ) {
    return this.fb.control({
      startDate: '',
      endDate:   ''
    })
  }

  deleteFrame(i: number, inputForm: UntypedFormGroup) {
    this.deleteArrayItem(i, inputForm, 'timeFrames')
  }
  deleteDateFrame(i: number, inputForm: UntypedFormGroup) {
    this.deleteArrayItem(i, inputForm, 'dateFrames')
  }
  deleteBrand(i: number, inputForm: UntypedFormGroup) {
    this.deleteArrayItem(i, inputForm, 'requiredBrands')
  }
  deleteCategory(i: number, inputForm: UntypedFormGroup) {
    this.deleteArrayItem(i, inputForm, 'requiredCategories')
  }
  deleteItem(i: number, inputForm: UntypedFormGroup) {
    this.deleteArrayItem(i, inputForm, 'requiredItems')
  }
  deleteItemType(i: number, inputForm: UntypedFormGroup) {
    this.deleteArrayItem(i, inputForm, 'requiredItemTypes')
  }
  deleteDiscountBrand(i: number, inputForm: UntypedFormGroup) {
    this.deleteArrayItem(i, inputForm, 'brandDiscounts')
  }
  deleteDiscountCategory(i: number, inputForm: UntypedFormGroup) {
    this.deleteArrayItem(i, inputForm, 'categoryDiscounts')
  }
  deleteDiscountItem(i: number, inputForm: UntypedFormGroup) {
    console.log('delete Item Discounts')
    this.deleteArrayItem(i, inputForm, 'itemDiscounts')
  }
  deleteDiscountItemType(i: number, inputForm: UntypedFormGroup) {
    this.deleteArrayItem(i, inputForm, 'itemTypesDiscounts')
  }
  deleteArrayItem(i: number, inputForm: UntypedFormGroup, controlName: string) {
    const control = inputForm.get(controlName) as UntypedFormArray;
    control.removeAt(i)
    // console.log(inputForm.value)
    this.priceScheduledataService.updatePriceSchedule(inputForm.value)
  }


}

