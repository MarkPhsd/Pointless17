import { CommonModule } from '@angular/common';
import { Component, Input, OnChanges, OnInit, Output,EventEmitter } from '@angular/core';
import { FormGroup, FormsModule, ReactiveFormsModule, UntypedFormBuilder } from '@angular/forms';
import { of, switchMap } from 'rxjs';
import { MenuService } from 'src/app/_services';
import { SitesService } from 'src/app/_services/reporting/sites.service';
import { BrandsResaleService, Brands_Resale } from 'src/app/_services/resale/brands-resale.service';
import { AppMaterialModule } from 'src/app/app-material.module';
import { SharedPipesModule } from 'src/app/shared-pipes/shared-pipes.module';
import { ValueFieldsComponent } from '../../../products/productedit/_product-edit-parts/value-fields/value-fields.component';
import { UploaderComponent } from 'src/app/shared/widgets/AmazonServices';
import { EditButtonsStandardComponent } from 'src/app/shared/widgets/edit-buttons-standard/edit-buttons-standard.component';

@Component({
  selector: 'brand-class-editor',
  standalone: true,
  imports: [CommonModule,AppMaterialModule,FormsModule,ReactiveFormsModule,
    ValueFieldsComponent,UploaderComponent,
    EditButtonsStandardComponent,
  SharedPipesModule],
  templateUrl: './brand-class-editor.component.html',
  styleUrls: ['./brand-class-editor.component.scss']
})
export class BrandClassEditorComponent implements OnInit,OnChanges {

  @Input() brand: Brands_Resale;
  @Output() outPutRefresh = new EventEmitter()
  @Input() inputForm: FormGroup;
  action$

  images: string;
  thumbnail: string;

  constructor(
    private fb                      : UntypedFormBuilder,
    private siteService             : SitesService,
    private brandsResaleService     : BrandsResaleService,
    private menuService             : MenuService,
  )
{  }

  ngOnInit(): void {
    this.images = null;
    this.thumbnail = null;
  }

  ngOnChanges() {
    this.initForm(this.brand)
    this.images = null;
    this.thumbnail = null;
    if (this.brand) {
      this.images = this.brand.images;
      this.thumbnail = this.brand.thumbnail;
      this.initForm(this.brand)
    }
  }

  setItemValues() {
    const site = this.siteService.getAssignedSite()
    let item = this.inputForm.value;

    item.brand = item.name;
    if (!item.id) {  item.id = 0 }
    item.brandID = item.id;

    this.action$ = this.brandsResaleService.save(site, item, item.id).pipe(switchMap(data => {
      this.outPutRefresh.emit(true)
      return of(data)
    }))
  }

  setImages(event) {
    this.inputForm.patchValue({images: event})
    this.setItemValues()
  }
  setThumbnail(event) {
    this.inputForm.patchValue({thumbNail: event})
    this.setItemValues()
  }

  initForm(brand) {
    this.inputForm =     this.fb.group({
      id: [],
      name: [],
      brandID_Barcode: [],
      gender: [],
      jeans: [],
      pants: [],
      crops: [],
      shorts: [],
      skirts: [],
      shirts: [],
      tops: [],
      polos: [],
      tees: [],
      tanks: [],
      sweaters: [],
      fleece: [],
      outerwear: [],
      seasonal: [],
      dresses: [],
      bags: [],
      flips: [],
      shoes: [],
      belts: [],
      jewelry: [],
      watch: [],
      sunglasses: [],
      hats: [],
      misc: [],
      images: [],
      brandID: [],
      thumbNail: [],
    })
    this.inputForm.patchValue(brand);



    this.inputForm.valueChanges.subscribe(data => {
      if (!data.id) {
        this.images = null;
        this.thumbnail = null
        return;
      }
      this.brand = data;
      const site = this.siteService.getAssignedSite()
      this.setItemValues()
    })
  }

  addBrand() {
    this.brand = {} as Brands_Resale
    this.brand = this.inputForm.value
    this.setItemValues()
  }
}
