import { Injectable } from '@angular/core';
import { MatLegacySnackBar as MatSnackBar } from '@angular/material/legacy-snack-bar';
import { ProductSearchModel } from 'src/app/_interfaces/search-models/product-search';
import { ButtonRendererComponent } from '../btn-renderer.component';
export interface rowItem {
  field: string,
  cellRenderer: string,
  cellRendererParams: any;
  minWidth: number;
  maxWidth: number;
  width   : number;
  flex: number;
  headerName: string;
  sortable: boolean;
}

function multilineRenderer(params): any {
  // console.log(params.data?.barcode, params.data?.productName)
  const productName = params.data?.productName || ''; // Fallback to empty string if undefined
  const barcode = params.data?.serialCode || ''; // Fallback to empty string if undefined
  return `${productName}-${barcode}`;
}


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

initGridOptionsClientType(pageSize: number, columnDefs: any)  {
  return {
    pagination: true,
    // rowModelType: 'clienttype',
    columnDefs: columnDefs,
    rowSelection: 'multiple',
    rowClassRules: this.rowClasses
  }
}

get rowClasses() {
  return  {

    "" :  (params) => {
      if (params.node.selected) {
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

    "row-female": (params) => {
      // console.log('gender female', params.api.getValue("id", params.node), params.api.getValue("gender", params.node))
      return params.api.getValue("gender", params.node) == 1
    },

    "row-male": (params) => {
      // console.log('gender male',  params.api.getValue("id", params.node),  params.api.getValue("gender", params.node))
      return params.api.getValue("gender", params.node) == 0
    },

    "row-groupNumber": (params) => {
      // console.log('gender male',  params.api.getValue("id", params.node),  params.api.getValue("gender", params.node))
      // return params.api.getValue("groupNumber", params.node) >= 1
      const value = params.api.getValue("groupNumber", params.node) >= 1;
      if (value) {
        return true
      }
    },

    "row-splitPayment": (params) => {
      // console.log('gender male',  params.api.getValue("id", params.node),  params.api.getValue("gender", params.node))
      // return params.api.getValue("groupNumber", params.node) >= 1
      const value = params.api.getValue("splitPayment", params.node) >= 1;
      if (value) {
        return true
      }

    },

    "row-metrc-posted": (params) => {
      const value = params.api.getValue("metrcResponse", params.node);
      if (!value || value == undefined) { return false }
      if (value === '') { return false }
      if (value) {
        const errorsExist = this.getErrors(value)
        if (errorsExist) { return false}
        return true
      }
    },

    "row-metrc-errors": (params) => {
      const value = params.api.getValue("metrcResponse", params.node);
      if (value === '') { return false }
      const errorsExist = this.getErrors(value)
      if (errorsExist) { return true}
      return false;
    },

    "row-metrc-submit-button": (params) => {
      const value = params.api.getValue("metrcResponse", params.node);
      if (value === '') { return true }
      const respsonseExists = this.getErrors(value)
      if (respsonseExists) { return true}
      return false;
    },
  }
}

getErrors(value) {
  if (value) {
    const item = JSON.parse(value)
    // console.log('item', item)
    if (item?.Errors) {
      return  true
    }
  }
}

multilineRenderer(params) {
  // console.log( params.data?.serialCode,  params.data?.productName)
  const productName = params.data?.productName || '';
  const barcode = params.data?.serialCode || '';
  return `${productName}<br>${barcode}`;
}


initGridOptions(pageSize: number, columnDefs: any, enableSorting?: boolean) {
  let sorting = true;
  if (enableSorting) {
    sorting = enableSorting;
  }

  return {
    pagination: true,
    paginationPageSize: pageSize,
    cacheBlockSize: pageSize,
    maxBlocksInCache: 50,
    rowModelType: 'infinite',
    infiniteInitialRowCount: 0,
    columnDefs: columnDefs,
    rowSelection: 'multiple',
    rowClassRules: this.rowClasses,
    enableFilter: true,
    enableSorting: sorting,
    frameworkComponents: {
      showMultiline: this.multilineRenderer, // Register the renderer function here
    },
  };
}


initGridOptionsClientSide(pageSize: number, columnDefs: any, enableSorting?: boolean) {
  let sorting = true;
  if (enableSorting) {
    sorting = enableSorting;
  }

  return {
    pagination: true,
    paginationPageSize: pageSize,
    cacheBlockSize: pageSize,
    maxBlocksInCache: 50,
    // rowModelType: 'clientSide',
    infiniteInitialRowCount: 0,
    columnDefs: columnDefs,
    rowSelection: 'multiple',
    rowClassRules: this.rowClasses,
    enableFilter: true,
    enableSorting: sorting,
    frameworkComponents: {
      showMultiline: this.multilineRenderer, // Register the renderer function here
    },
  };
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
    enableSorting: true,
    rowClassRules: {
      "row-fail": params => params.api.getValue("packageCountRemaining", params.node) < 10,
      "row-pass": params => params.api.getValue("packageCountRemaining", params.node) >= 10,
      "row-unassigned": params => params.api.getValue("manifestID", params.node) == 0,
      "row-manifest": params => params.api.getValue("manifestID", params.node) >= 1,
      "row-female": params => params.api.getValue("gender", params.node) >= 0,
      "row-male": params => params.api.getValue("gender", params.node) == 0,
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
                         currentPage: number, itemTypeID: number, brandID: number, subCategoryID?: number): ProductSearchModel {
    let productSearchModel = {} as ProductSearchModel;
    productSearchModel.name = search
    productSearchModel.barcode = search

    if (subCategoryID) {
      productSearchModel.subCategoryID = subCategoryID;
    }

    if (categoryID && categoryID != 0) {
      productSearchModel.categoryID  = categoryID;
    }

    if (itemTypeID && itemTypeID !=0) {
      productSearchModel.itemTypeID = itemTypeID;
    }

    if (brandID) {
      productSearchModel.brandID = brandID;
    }

    productSearchModel.pageSize   = pageSize
    productSearchModel.pageNumber = currentPage
    return productSearchModel
  }

}
