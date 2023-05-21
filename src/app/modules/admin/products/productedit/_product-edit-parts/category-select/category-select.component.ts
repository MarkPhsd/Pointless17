import { Component, OnInit, Input , Output, EventEmitter} from '@angular/core';
import { IMenuItem } from 'src/app/_interfaces/menu/menu-products';
import { SitesService } from 'src/app/_services/reporting/sites.service';
import { Observable, of,switchMap } from 'rxjs';
import { MenuService } from 'src/app/_services';
import { UntypedFormGroup } from '@angular/forms';

@Component({
  selector: 'app-category-select',
  templateUrl: './category-select.component.html',
  styleUrls: ['./category-select.component.scss']
})
export class CategorySelectComponent implements OnInit {
  loadingItems: boolean;

  @Input() fieldName = 'categoryID'
  @Input() type      = 'category'
  @Input() inputForm :    UntypedFormGroup;
  categories$        :    Observable<IMenuItem[]>;
  @Output() outputCategoryID   :      EventEmitter<any> = new EventEmitter();

  constructor(private menuService: MenuService,
            private sitesService: SitesService) { }

  ngOnInit(): void {
    const site =            this.sitesService.getAssignedSite();
    this.loadingItems = true;
    const type        = this.type;
    const item$       = this.menuService.getGetCategoriesListAll(site, type)

    if (this.type.toLowerCase() == 'subcategory') {
      this.fieldName = 'subCategoryID'
    }

    if (this.type.toLowerCase() == 'category') {
      this.fieldName = 'categoryID'
    }

    this.categories$ =  item$.pipe(
      switchMap(data => {
        this.loadingItems = false;
        return of(data)
      })
    )
  }

  getCategory(event) {
    this.outputCategoryID.emit(event.value)
  }

  clearItem() {

    if (this.type.toLowerCase() == 'subcategory') {
      this.inputForm.patchValue({subCategoryID: 0})
      // this.outputCategoryID.emit(0)
    }

    if (this.type.toLowerCase() == 'category') {
      this.inputForm.patchValue({categoryID: 0})
      this.outputCategoryID.emit(0)
    }

  }


}
