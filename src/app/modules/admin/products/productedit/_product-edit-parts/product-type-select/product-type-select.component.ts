import { Component, EventEmitter, Input, OnInit,Output } from '@angular/core';
import { IItemBasic, IItemBasicB } from 'src/app/_services';
import { ItemTypeService } from 'src/app/_services/menu/item-type.service';
import { SitesService } from 'src/app/_services/reporting/sites.service';
import { Observable } from 'rxjs';
import { UntypedFormGroup ,FormControl, UntypedFormBuilder, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { IProduct } from 'src/app/_interfaces';
import { CommonModule } from '@angular/common';
import { AppMaterialModule } from 'src/app/app-material.module';
import { SharedPipesModule } from 'src/app/shared-pipes/shared-pipes.module';

@Component({
  selector: 'product-type-select',
  standalone: true,
  imports: [CommonModule,AppMaterialModule,FormsModule,ReactiveFormsModule,FormsModule,ReactiveFormsModule,
  SharedPipesModule],
  templateUrl: './product-type-select.component.html',
  styleUrls: ['./product-type-select.component.scss']
})
export class ProductTypeSelectComponent implements OnInit {

  @Input() itemTypeID     : number;
  @Input() inputForm      : UntypedFormGroup;

  productTypes$           : Observable<IItemBasicB[]>;

  @Output() outputItemTypeID   :      EventEmitter<any> = new EventEmitter();

  constructor(private itemTypeService: ItemTypeService,
              private siteService: SitesService,
              private fb: UntypedFormBuilder,
              )
        { }

  async ngOnInit() {
    const site = this.siteService.getAssignedSite();
    this.productTypes$ = this.itemTypeService.getBasicTypes(site)
  }

  onSelect(event) {
    console.log(event.value)
    this.outputItemTypeID.emit(event.value)
  }

}
