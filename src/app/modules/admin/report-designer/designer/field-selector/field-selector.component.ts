import { CdkDragDrop, moveItemInArray, transferArrayItem } from '@angular/cdk/drag-drop';
import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { UntypedFormBuilder, UntypedFormGroup } from '@angular/forms';
import { Observable, Subscription, of, switchMap } from 'rxjs';
import { ReportDesignerService } from '../../services/report-designer.service';
import { viewBuilder_View_Field_Values, viewBuilder_ReportJSON } from '../../interfaces/reports';
import { IListBoxItem, IListBoxItemC } from 'src/app/_interfaces/dual-lists';
import { UUID } from 'angular2-uuid';
import { CommonModule } from '@angular/common';
import { AppMaterialModule } from 'src/app/app-material.module';
import { SharedPipesModule } from 'src/app/shared-pipes/shared-pipes.module';
@Component({
  selector: 'psReporting-field-selector',
  standalone: true,
  imports: [CommonModule,AppMaterialModule,SharedPipesModule],
  templateUrl: './field-selector.component.html',
  styleUrls: ['./field-selector.component.scss']
})
export class FieldSelectorComponent implements OnInit {

 // field to use for value of option
//  @Input() viewBuilder_View_Field_Values = [] as viewBuilder_View_Field_Values[];

 @Input() valueField = 'id' as string | {};
 // field to use for displaying option text
 @Input() textField = 'name';
 // text displayed over the available items list box
 @Input() availableText = 'Available items';
 // text displayed over the selected items list box
 @Input() selectedText = 'Selected items';
 // set placeholder text in available items list box
 @Input() availableFilterPlaceholder = 'Filter...';
 // set placeholder text in selected items list box
 @Input() selectedFilterPlaceholder = 'Filter...';
 // event called when items are moved between boxes, returns state of both boxes and item moved
 @Output() saveSelected: EventEmitter<any> = new EventEmitter<any>();

 //  @Input() viewBuilder_View_Field_Values = [] as viewBuilder_View_Field_Values[];
 @Input() allFields = [] as viewBuilder_View_Field_Values[];

 _report: Subscription | undefined;
 _fieldList: Subscription | undefined;

 report = {} as viewBuilder_ReportJSON

 // eslint-disable-next-line @typescript-eslint/no-inferrable-types
 processSaving : boolean = false
 action$: Observable<unknown> | undefined;
 // eslint-disable-next-line @typescript-eslint/no-inferrable-types
 processRetrieving : boolean = false
 saving$: Observable<unknown> | undefined;

 // eslint-disable-next-line @typescript-eslint/no-inferrable-types
 availableFields: Array<IListBoxItemC> = [] as IListBoxItemC[];
 // eslint-disable-next-line @typescript-eslint/no-inferrable-types
 selectedFields  : Array<IListBoxItemC> = [] as IListBoxItemC[];
 listBoxForm   : UntypedFormGroup | undefined;

 // array of items to display in left box
 @Input() set availables(items: any) {
  //  this.availableFields = [...(items || []).map((item: {}, index: number) => ({
  //    value: item[this.valueField].toString(),
  //    text: item[this.textField].toString(),
  //    groupID: 0,
  //  }))];
  this.availableFields = [] as IListBoxItemC[];
 }
 // array of items to display in right box
 //(items: Array<{}>) {
 @Input() set selects(items: any) {
  //  this.selectedFields = [...(items || []).map((item: {}, index: number) => ({
  //    value: item[this.valueField].toString(),
  //    text: item[this.textField].toString(),
  //    groupID: 0,
  //  }))];
  this.selectedFields = [] as IListBoxItemC[];
 }

  assignedStatic   : any;
  allAssigned      : any;

  constructor(
      private reportDesignerService: ReportDesignerService,
      public fb: UntypedFormBuilder) {
    this.listBoxForm = this.fb.group({
      availableSearchInput: [''],
      selectedSearchInput: [''],
    });
  }

  ngOnInit(): void {
    this._fieldList = this.reportDesignerService.fieldsList$.subscribe(data =>{
      this.allFields = data;
    })

    this._report = this.reportDesignerService.report$.pipe(
      switchMap(data => {
        this.report = data;
        return this.reportDesignerService.fieldsList$
      })
    ).subscribe(data =>{
      this.allFields = data;
      this.assignSelectedAndAvalible(this.report.fields)
    })
  }

  resetFieldSelection() {
    this.report.fields = [];
    this.selectedFields = [];
    this.saveFieldSelection()
    this.assignSelectedAndAvalible(this.report.fields)
  }

  assignSelectedAndAvalible(selected: viewBuilder_View_Field_Values[]) {
    //get Avalible Fields

    const allFields = this.allFields as viewBuilder_View_Field_Values[]
    if (selected && selected.length > 0) {
      const fields = selected
      //for each of these, we can remove matching item from the avalble list.  //avalible
      //Also we assign the in useGroupTaxes to the assigned list. //selected
      this.selectedFields = [];

      fields.forEach(item => {
        if (item && !item.id) {

        } else {
          this.selectedFields.push({groupID: 0, value:
                                    item?.id.toString(),
                                    text: item.name,
                                    fieldTypeAggregate: item.fieldTypeAggregate,
                                    type: item.type})
        }
      })
      this.removeSelectedFromAvailable(allFields, fields)
      return
    }
    if (selected && selected.length == 0) { }
    //!!!
    this.removeSelectedFromAvailable(allFields, [])
  }

  removeSelectedFromAvailable( xallFields  : viewBuilder_View_Field_Values[],
                              xallAssigned: viewBuilder_View_Field_Values[]): IListBoxItem[] {

    let allFields     = xallFields.map( item => ({ groupID: 0,value: item.id.toString(),
                                                  text: item.name,
                                                  fieldTypeAggregate: item.fieldTypeAggregate,
                                                  type: item.type }));

    if (xallAssigned  != undefined) {
      let allAssigned = xallAssigned.map( item => ({ groupID: 0, value: item.toString(),
                                                    text: item.name,
                                                    fieldTypeAggregate: item.fieldTypeAggregate,
                                                    type: item.type }));
      allAssigned.forEach(item => {
        if (item && !item.text) {
        } else {
          const value = allFields.find( x => x.text.toLowerCase() === item.text.toLowerCase() )
          if (value) {
            allFields = allFields.filter(item => item !== value)
          }
        }
      })
      if (allAssigned != undefined) {
        allFields =  allFields.filter(item => !allAssigned.includes(item));
      }
    }


    //  this.refreshUnselected(allFields)
    this.displayAllFields()
    return allFields;

  }

  displayAllFields(){
    let fields = [] as IListBoxItemC[];
    this.allFields.forEach(data => {
      let field = {} as IListBoxItemC
      field.fieldTypeAggregate = data.fieldTypeAggregate;
      field.value = data.id;
      field.text = data.name;
      field.type = data.type;
      fields.push(field)
  })
  this.availableFields = fields;
 }

 refreshUnselected(allFields: IListBoxItemC[]) {
    this.availableFields  = allFields //.map( item =>          ({ value: item.value.toString(), text: item.name }));
 }

 //we are saving the Whole List of assigned or
 //we are saving the added.
 // i feel like it's easier to push the whole list,
 //and keep a reference to the selecteditems, then push the whole list.
 saveFieldSelection() {
   this.saveSelected.emit(this.report.fields)
 }

 convertToIlistBoxItem(listSource: any[]): IListBoxItem[] {
   var result = listSource.map(item => ({ groupID: 0,value:
                                          item.id.toString(),
                                          text: item.name,
                                          fieldTypeAggregate: item.fieldTypeAggregate,
                                          type: item.type }));
   return result
 }
 convertListBoxToField(item: IListBoxItemC): viewBuilder_View_Field_Values {
  const newItem  = {} as  viewBuilder_View_Field_Values;
  newItem.fieldTypeAggregate = item?.fieldTypeAggregate;
  newItem.id   = UUID.UUID();
  newItem.name = item?.text
  newItem.type = item?.type;
  return newItem;
  // return result
}

 setItemType(event: unknown) {
   // this.taxRate = event;
   // this.taxID = this.taxRate.id;
   this.selectedFields =[]
   // this.refreshTaxAssignment(this.taxRate.id)
 }

 addItem(item:IListBoxItemC) {
  console.log(item)
  let newItem = this.convertListBoxToField(item);
  if (!this.report.fields) {
    this.report.fields = []
  }
  this.report.fields.push(newItem);
  this.reportDesignerService.updateReport(this.report)
 }

 drop(event: CdkDragDrop<IListBoxItemC[]>) {

   if (event.previousContainer === event.container) {
     moveItemInArray(event.container.data, event.previousIndex, event.currentIndex);
   } else {
     transferArrayItem(event.previousContainer.data, event.container.data,
                       event.previousIndex, event.currentIndex);
   }

   // clear marked available items and emit event
   //assign the selected items to the current itemType selected.

   const movedItems = event.container.data.filter((v, i) => i === event.currentIndex)
   let item = {} as viewBuilder_View_Field_Values

   if (movedItems){
    item.id = movedItems[0].value;
    item.name = movedItems[0].text;
    item.fieldTypeAggregate  = movedItems[0].fieldTypeAggregate;
    item.type = movedItems[0].type;
    this.report.fields.push(item)
    this.selectedFields.push(movedItems[0])
   }
   let i = 1
   this.report.fields.forEach(data => {
    data.order = i;
    i += 1
   })

   const names = this.report.fields.map(o => o.name)
   const filtered = this.report.fields.filter(({name}, index) => !names.includes(name, index + 1))
   this.report.fields = filtered;

   this.saveFieldSelection()

 }

 searchItemsReset() {
   // this.pageSize = 1
   // const site = this.siteService.getAssignedSite()
   // const productSearchModel = this.initProductSearchModel(this.search);
   // this.menuItems$ = this.menuService.getProductsBySearchForLists(site, productSearchModel)
 }

}
