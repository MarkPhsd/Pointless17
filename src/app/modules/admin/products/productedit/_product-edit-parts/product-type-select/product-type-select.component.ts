import { Component, EventEmitter, Input, OnInit,Output } from '@angular/core';
import { IItemBasic, IItemBasicB } from 'src/app/_services';
import { ItemTypeService } from 'src/app/_services/menu/item-type.service';
import { SitesService } from 'src/app/_services/reporting/sites.service';
import { Observable } from 'rxjs';
import { FormGroup ,FormControl, FormBuilder } from '@angular/forms';
import { IProduct } from 'src/app/_interfaces';

@Component({
  selector: 'product-type-select',
  templateUrl: './product-type-select.component.html',
  styleUrls: ['./product-type-select.component.scss']
})
export class ProductTypeSelectComponent implements OnInit {

  @Input() itemTypeID     : number;
  @Input() inputForm      : FormGroup;

  productTypes$           : Observable<IItemBasicB[]>;

  @Output() outputItemTypeID   :      EventEmitter<any> = new EventEmitter();

  constructor(private itemTypeService: ItemTypeService,
              private siteService: SitesService,
              private fb: FormBuilder,
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
