import { T } from '@angular/cdk/keycodes';
import { Component, Input, OnInit } from '@angular/core';
import { FormGroup, FormBuilder } from '@angular/forms';
import { Observable, Subscription, of, switchMap } from 'rxjs';
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



  action$ : Observable<any>;
  @Input()  pb_Main: PB_Main;
  @Input() inputForm: FormGroup;

  _PB_Main: Subscription;
  productName: string;
  searchForm: FormGroup;
  componentForm: FormGroup;
  pb_Component: PB_Components;
  pb_Components$: Observable<PB_Components>;

  menuItem: IMenuItem;
  menuItem$: Observable<IMenuItem>;

  site = this.siteService.getAssignedSite()
  id: number;

  initSubscription() {
    this._PB_Main = this.partBuilderMainMethodsService.PB_Main$.subscribe(data => {
      this.pb_Main = data;
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

  initData() {
    const item = {} as PB_Main;
    item.name = 'Example'
    item.pb_Components = [] as PB_Components[]
    item.id = 1;

    let comp = {} as PB_Components;
    comp.cost = 5
    comp.price = 10;
    comp.quantity = 1;
    comp.pb_MainID = 1

    item.pb_Components.push(comp)
    comp = {} as PB_Components;
    comp.cost = 6
    comp.price = 12;
    comp.quantity = 1.2;
    comp.pb_MainID = 1

    item.pb_Components.push(comp)
    comp = {} as PB_Components;
    comp.cost = 3
    comp.price = 5;
    comp.quantity = 1.1;
    comp.pb_MainID = 1

    this.partBuilderMainMethodsService.updatePBMain(item)
    this.initSubscription()
    this.initSearchForm()
  }


  ngOnInit(): void {
    this.initSubscription()
    this.initSearchForm()
  }

  enableEdit(item: PB_Components) {
    this.pb_Component = item;
    console.log(item)
    this.initComponentForm(item)
  }

  initComponentForm(item: PB_Components) {
    this.componentForm = this.fb.group({
      id: [],
      name: [],
      productID: [],
      unitTypeID:[],
      quantity:[],
      cost:[],
      price:[],
    })
    this.componentForm.patchValue(item)
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
    this.action$ = this.partBuilderComponent.delete(this.site, item.id).pipe(switchMap(data => {
      if (!data || data.toString().toLowerCase() === 'not found') {
        this.siteService.notify(' Item not found or deleted', 'close', 2000, 'red')
      }
      return this.updateView()
    }))
  }

  updateView() {
    const item$ = this.partBuilderMainService.getItem(this.site, this.pb_Main.id).pipe(switchMap(data => {
      this.partBuilderMainMethodsService.updatePBMain(data)
      return of(data)
    }))
    return item$
  }

  getItem(event) {
    const item = event
    if (item && item.id) {
      // console.log('get item')
      this.menuService.getMenuItemByID(this.site, item.id).subscribe(data => {
          this.menuItem = data
          this.pb_Component.price = data.retail;
          this.pb_Component.cost = data.wholeSale;
          this.pb_Component.productID = data.id;
          this.pb_Component.unitTypeID = data.unitTypeID;
          this.pb_Component.quantity = this.componentForm.controls['quantity'].value;
          this.pb_Component.product = this.menuItem;
          this.componentForm.patchValue(this.pb_Component);

          this.pb_Main.pb_Components.forEach(data => {
            if (data.id == this.pb_Component.id) {
              data = this.pb_Component;
            }
          })

          this.initSearchForm();
        }
      )
    }
  }

}
