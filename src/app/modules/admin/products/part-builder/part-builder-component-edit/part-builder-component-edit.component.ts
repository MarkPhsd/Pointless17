import { T } from '@angular/cdk/keycodes';
import { Component, Input, OnInit } from '@angular/core';
import { FormGroup, FormBuilder, UntypedFormGroup } from '@angular/forms';
import { Observable, Subscription, of, switchMap } from 'rxjs';
import { UnitType } from 'src/app/_interfaces';
import { IMenuItem } from 'src/app/_interfaces/menu/menu-products';
import { MenuService } from 'src/app/_services';
import { PartBuilderComponentService } from 'src/app/_services/partbuilder/part-builder-component.service';
import { PartBuilderMainMethodsService } from 'src/app/_services/partbuilder/part-builder-main-methods.service';
import { PB_Components, PB_Main, PartBuilderMainService } from 'src/app/_services/partbuilder/part-builder-main.service';
import { SitesService } from 'src/app/_services/reporting/sites.service';

@Component({
  selector: 'part-builder-component-edit',
  templateUrl: './part-builder-component-edit.component.html',
  styleUrls: ['./part-builder-component-edit.component.scss']
})
export class PartBuilderComponentEditComponent implements OnInit {

  action$  : Observable<any>;
  @Input()  pb_Main: PB_Main;
  @Input()  inputForm: FormGroup;
  unitSearchForm: UntypedFormGroup;
  _PB_Main: Subscription;
  productName: string;
  searchForm: FormGroup;
  componentForm: FormGroup;
  pb_Component: PB_Components;
  pb_Components$: Observable<PB_Components>;
  indexValue: number = 1;
  menuItem: IMenuItem;
  menuItem$: Observable<IMenuItem>;

  site = this.siteService.getAssignedSite()
  id: number;

  initSubscription() {
    this._PB_Main = this.partBuilderMainMethodsService.PB_Main$.subscribe(data => {
      this.pb_Main = data;
      console.log('data updated', data)
    })
  }

  constructor(private siteService: SitesService,
              private fb: FormBuilder,
              private partBuilderMainService: PartBuilderMainService,
              private partBuilderMainMethodsService: PartBuilderMainMethodsService,
              private partBuilderComponent: PartBuilderComponentService,
              private menuService: MenuService,
              ) {
  }
  ngOnInit(): void {
    this.initSubscription()
    this.initSearchForm()
  }

  initData() {
    const item = {} as PB_Main;
    item.name = 'Example'
    item.pB_Components = [] as PB_Components[]
    item.id = -1;

    let comp = {} as PB_Components;
    comp.id = 1;
    comp.cost = 5
    comp.price = 10;
    comp.quantity = 1;
    // comp.pb_MainID = 1

    item.pB_Components.push(comp)
    comp = {} as PB_Components;
    comp.id = 2;
    comp.cost = 6
    comp.price = 12;
    comp.quantity = 1.2;
    // comp.pb_MainID = 1

    item.pB_Components.push(comp)
    comp = {} as PB_Components;
    comp.id = 3;
    comp.cost = 3;
    comp.price = 5;
    comp.quantity = 1.1;
    // comp.pb_MainID = 1

    this.refreshData(item)
  }


  addItem() {
    let item = {} as PB_Main;
    if (!this.pb_Main) {
      this.pb_Main = item
    } else {
      item = this.pb_Main
    }

    if (!item.pB_Components) {
      item.pB_Components = [] as PB_Components[]
    }

    let comp = {} as PB_Components;
    comp.id = this.index;
    comp.cost = 0
    comp.price = 0;
    comp.quantity = 1;
    item.pB_Components.push(comp)
    this.pb_Main = item;
    this.refreshData(item)
    this.enableEdit(comp);
  }

  refreshData(item) {
    this.partBuilderMainMethodsService.updatePBMain(item)
    this.initSubscription()
    this.initSearchForm()
  }

  get index() {
    // this.indexValue += 1
    return this.getRandomInt(1, 2000000)
  }

  getRandomInt(min, max) : number{
    min = Math.ceil(min);
    max = Math.floor(max);
    return Math.floor(Math.random() * (max - min + 1)) + min;
  }

  updateView() {
    const item$ = this.partBuilderMainService.getItem(this.site, this.pb_Main.id).pipe(switchMap(data => {
      this.partBuilderMainMethodsService.updatePBMain(data)
      return of(data)
    }))
    return item$
  }

  enableEdit(item: PB_Components) {
    this.pb_Component = item;
    this.initComponentForm(item)
  }

  initComponentForm(item: PB_Components) {
    this.componentForm = this.fb.group({
      id: [],
      name: [],
      productID: [],
      unitTypeID:[],
      unitName: [],
      quantity:[],
      cost:[],
      price:[],
      product: []
    })

    this.componentForm.patchValue(item);
    this.initUnitSearchForm(item)
  }

  initSearchForm() {
    this.searchForm = this.fb.group( {
      productName: []
    })
  }

  edit(item) {
    this.action$ =  this.partBuilderComponent.save(this.site, item.id).pipe(switchMap(data => {
      if (!data || data.toString().toLowerCase() === 'not found') {
        this.siteService.notify(' Item not found or updated', 'close', 2000, 'red')
      }
      return this.updateView()
    }))
  }

  delete(item) {
    if (this.pb_Main.pB_Components) {
      this.pb_Main.pB_Components = this.pb_Main.pB_Components.filter(data => {return data.id != item.id})

      this.action$ = this.partBuilderComponent.deleteComponent(this.site, item.id).pipe(switchMap(data => {
        if (!data || data.toString().toLowerCase() === 'not found') {
          this.siteService.notify(' Item not found or deleted', 'close', 2000, 'red')
        }
        return of(data)
      }))
    }
  }

  assignItem(event) {
    if (this.pb_Component) {
      this.pb_Component.unitType = event
      this.pb_Component.unitTypeID = event.id;
      this.pb_Component.unitName = event?.name
      this.componentForm.patchValue(this.pb_Component);
    }
  }

  getItem(event) {
    const item = event
    if (item && item.id) {
      this.menuService.getMenuItemByID(this.site, item.id).subscribe(data => {
          this.menuItem = data
          this.pb_Component.price = data.retail;
          this.pb_Component.cost = data.wholeSale;
          this.pb_Component.productID = data.id;
          this.pb_Component.unitTypeID = data.unitTypeID;
          this.pb_Component.name = data.name;
          this.pb_Component.quantity = +this.componentForm.controls['quantity'].value;
          this.pb_Component.product = this.menuItem;
          this.componentForm.patchValue(this.pb_Component);
          this.setThisPBComponent(this.pb_Component)
          this.initSearchForm();
        }
      )
    }
  }

  setThisPBComponent(component: PB_Components) {
    const item = this.pb_Main.pB_Components.filter(data => {return data.id == component.id})
    const result = this.pb_Main.pB_Components.find(data => {
      if (data.id == component.id) {
        this.pb_Main.pB_Components = this.replaceObject(component, this.pb_Main.pB_Components);
      }
    })

    this.partBuilderMainMethodsService.updatePBMain(this.pb_Main)
  }

  replaceObject(newObj: any, list: any[]): any[] {
    return list.map((obj) => obj.id === newObj.id ? newObj : obj);
  }

  initUnitSearchForm(item: PB_Components) {
    if (!item) {
      this.clearUnit()
      return
    }
    this.componentForm.patchValue({ unitTypeID: item.unitTypeID})
    this.unitSearchForm = this.fb.group({
      searchField: [item?.unitType?.name]
    })
  }
  clearUnit() {
    this.componentForm.patchValue({ unitTypeID: 0})
    this.unitSearchForm = this.fb.group({
      searchField: []
    })
  }

  saveEdit() {
    if (this.componentForm) {
      this.pb_Component = this.componentForm.value
      this.setThisPBComponent(this.pb_Component);
      this.componentForm = null
    }
  }

}
