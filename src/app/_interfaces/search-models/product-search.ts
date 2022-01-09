
export interface ProductSearchModel {

  barcode:                      string;
  name:                         string;
  subCategory:                  string;
  category:                     string;
  department:                   string;
  brandID:                      string;
  categoryID:                   string;
  departmentID:                 string;
  type:                         number;
  retail:                       number;
  viewAll                   : number;
  priceGreaterTrueSmallerFalse: boolean;
  tags:                         string;
  description:                  string;
  useNameInAllFields:          boolean;
  pageSize:                     number;
  pageNumber:                   number;
  pageCount:                    number;
  currentPage:                  number;
  lastPage:                     number;
  recordCount:                  number;
  itemTypeID :                  string;
  loadChildren     :            boolean;
  maxPrice                    : string;
  minPrice                    : string;
  priceCategoryID             : string;
  //genereal descriptions not searching
  brandName                 : string;
  categoryName              : string;
  itemTypeName              : string;
  departmentName            : string;
  searchValue               : string;
  active                    : boolean;
  metrcCategory             : string;
  species                   : string;
  web                       : boolean;
  exactNameMatch            : boolean;
}


// Public Property barcode As String
// Public Property Name As String
// Public Property SubCategory As String
// Public Property Category As String
// Public Property Department As String
// Public Property BrandID As String
// Public Property CategoryID As String
// Public Property DepartmentID As String
// Public Property Retail As Decimal
// Public Property PriceGreaterTrueSmallerFalse As Boolean
// Public Property Tags As String
// Public Property Description As String
// Public Property UseNameInAllFields As Boolean
// Public Property PageSize As Integer
// Public Property PageNumber As Integer
// Public Property PageCount As Integer
// Public Property RecordCount As Integer
// Public Property CurrentPage As Integer
// Public Property LastPage As Integer
// Public Property ProdModifierType As Integer
