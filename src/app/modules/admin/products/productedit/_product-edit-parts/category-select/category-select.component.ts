import { Component, OnInit, Input , Output, EventEmitter} from '@angular/core';
import { IMenuItem } from 'src/app/_interfaces/menu/menu-products';
import { SitesService } from 'src/app/_services/reporting/sites.service';
import { Observable } from 'rxjs';
import { MenuService } from 'src/app/_services';
import { FormGroup } from '@angular/forms';

@Component({
  selector: 'app-category-select',
  templateUrl: './category-select.component.html',
  styleUrls: ['./category-select.component.scss']
})
export class CategorySelectComponent implements OnInit {

  @Input()  inputForm:      FormGroup;
  categories$:              Observable<IMenuItem[]>;
  @Output() outputCategoryID   :      EventEmitter<any> = new EventEmitter();

  constructor(private menuService: MenuService,
            private sitesService: SitesService) { }

  ngOnInit(): void {
    const site =            this.sitesService.getAssignedSite();
    this.categories$ =      this.menuService.getListOfCategoriesAll(site);
  }

  getCategory(event) {
    console.log(event)
    this.outputCategoryID.emit(event.value)
  }

}
