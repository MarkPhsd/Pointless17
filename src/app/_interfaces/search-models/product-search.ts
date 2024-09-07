
export interface ProductSearchModel {
  vendorID: number;
  // productSupplierCatID: number;
  barcode?:                      string;
  name?:                         string;
  productID?                   : number;
  subCategory?:                  string;
  category?:                     string;
  department?:                   string;
  brandID?:                      number;
  categoryID?:                   number;
  departmentID?:                 number;
  subCategoryID?:                number;
  type?:                         number;
  retail?:                       number;
  viewAll?                   : number;
  priceGreaterTrueSmallerFalse?: boolean;
  tags?:                         string;
  description?:                  string;
  useNameInAllFields?:          boolean;
  pageSize?:                     number;
  pageNumber?:                   number;
  pageCount?:                    number;
  currentPage?:                  number;
  lastPage?:                     number;
  recordCount?:                  number;
  itemTypeID? :                  number;
  loadChildren?     :            boolean;
  maxPrice?                    : string;
  minPrice?                    : string;
  priceCategoryID?             : number;
  brandName?                 : string;
  categoryName?              : string;
  itemTypeName?              : string;
  departmentName?            : string;
  searchValue?               : string;
  active?                    : boolean;
  metrcCategory?             : string;
  species?                   : string;
  web?                       : boolean;
  webMode?                    : boolean;
  exactNameMatch              : boolean;
  sku?                       : string;
  itemTypeIDList?            : number[];
  hideSubCategoryItems?      : boolean;
  gf?: boolean;
  listTypeID ?        : number[];
  listPublisherID?    : number[] ;
  listArtistID?       :  number[];
  listBrandID?        : number[];
  listDepartmentID?   :  number[];
  listCategoryID ?    :  number[];
  listSubCategoryID?  : number[];
  listSpecies?        : number[];
  listSize?           : number[];
  listColor ?         : number[];
  minQuantityFilter?  : number;
  webWorkRequired?: boolean;
  sort?: string;
  gender?: number;
  bayName?: string;
  genderAny?: boolean;
  sort1? : string;//=  searchForm.sort1
  sortBy1?    : string;// =  searchForm.sortBy1
  sortBy1Asc? : string;
  sortBy2?    : string;//=  searchForm.sortBy2
  sortBy2Asc? : string;//=  searchForm.sortBy2Asc
  sortBy3?    : string;//=  searchForm.sortBy3Asc
  sortBy3Asc? : string;// =  searchForm.sortBy3Asc
  barCodeAltSearch: string;
}
