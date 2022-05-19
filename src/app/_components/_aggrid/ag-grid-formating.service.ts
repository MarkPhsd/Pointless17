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
    rowClassRules: {

      "" :  (params) => {
        if (params.node.selected) {
          console.log('selected')
          return true;
        }
      },

      "row-not-forsale" :  (params) => {
        const value = params.api.getValue("notAvalibleForSale", params.node) == true;
        if (value) {
          return true
        }
      },

      "row-manifest-rejected" :  (params) => {
        const value = params.api.getValue("rejected", params.node) != null;
        if (value) {
          return true
        }
      },

      "row-active" :  (params) => {
        const value = params.api.getValue("active", params.node) != false;
        if (value) {
          return true
        }
      },

      "row-not-active" :  (params) => {
        const value = params.api.getValue("active", params.node) == false;
        if (value) {
          return true
        }
      },

      "row-unassigned": (params) => {
        return params.api.getValue("manifestID", params.node) == 0
      },

      "row-manifest": (params) => {
        return params.api.getValue("manifestID", params.node) >= 1
      },

    },
  }

}

initGridOptionsFormated(pageSize: number, columnDefs: any) {

  if (!columnDefs) { return null };

  const grid = {
    // rowClassRules: this.getRowCalassRules(),
    pagination: true,
    paginationPageSize: pageSize,
    cacheBlockSize: 20,
    maxBlocksInCache: 50,
    rowModelType: 'infinite',
    infiniteInitialRowCount: 0,
    columnDefs: columnDefs,
    rowSelection: 'multiple',
    rowClassRules: {
      "row-fail": params => params.api.getValue("packageCountRemaining", params.node) < 10,
      "row-pass": params => params.api.getValue("packageCountRemaining", params.node) >= 10,
      "row-unassigned": params => params.api.getValue("manifestID", params.node) == 0,
      "row-manifest": params => params.api.getValue("manifestID", params.node) >= 1
    },
  }

  return grid

}
// getRowCalassRules() {
//   return {
//     'row-unassigned' : function(params) { return params.data.manifestID == 0  },
//     'row-manifest'   : function(params) { return params.data.manifestID >= 0  },
//   }
// }

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
