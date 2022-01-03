import { Injectable } from '@angular/core';
import { MatSnackBar } from '@angular/material/snack-bar';
import { ProductSearchModel } from 'src/app/_interfaces/search-models/product-search';
import { ButtonRendererComponent } from '../btn-renderer.component';

@Injectable({
  providedIn: 'root'
})
export class AgGridFormatingService {

  constructor(private _snackbar: MatSnackBar) { }

initFrameworkComponents() {
  return {
    btnCellRenderer: ButtonRendererComponent
  };
}

initDefaultColumnDef() {
  return {
    flex: 1,
    minWidth: 100,
  };
}

initGridOptions(pageSize: number, columnDefs: any)  {
  return {
    pagination: true,
    paginationPageSize: pageSize,
    cacheBlockSize: 20,
    maxBlocksInCache: 50,
    rowModelType: 'infinite',
    infiniteInitialRowCount: 0,
    columnDefs: columnDefs,
    rowSelection: 'multiple',
  }
}

  initProductSearchModel(categoryID: number, search: string, pageSize: number,
                         currentPage: number, itemTypeID: number, brandID: number): ProductSearchModel {
    let productSearchModel = {} as ProductSearchModel;
    productSearchModel.name = search
    productSearchModel.barcode = search

    if (categoryID && categoryID != 0) {
      productSearchModel.categoryID  = categoryID.toString();
    }

    if (itemTypeID && itemTypeID !=0) {
      productSearchModel.itemTypeID = itemTypeID.toString();
    }

    if (brandID) {
      productSearchModel.brandID = brandID.toString();
    }

    productSearchModel.pageSize   = pageSize
    productSearchModel.pageNumber = currentPage
    return productSearchModel
  }


}
