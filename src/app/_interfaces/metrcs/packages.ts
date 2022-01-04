// Generated by https://quicktype.io
// Generated by https://quicktype.io



export interface PackageFilter {

  label:                string;
  unitOfMeasureName:    string;
  itemFromFacilityName: string;
  productName:          string;
  productCategoryName:  string;
  packageType:          string;
  hasImported:          boolean;// Generated by https://quicktype.io
  active      :         number;
  pageSize    : number;
  pageNumber  : number;
  pageCount   : number;
  recordCount : number;
  currentPage : number;
  lastPage    : number;
  iSLastPage  : number;
  iSFirstPage : number;
}

// Generated by https://quicktype.io

export interface METRCPackage {
  id:                                number;
  label:                             string;
  packageType:                       string;
  sourceHarvestName:                 null;
  locationID:                        null;
  locationName:                      null;
  locationTypeName:                  null;
  quantity:                          number;
  unitOfMeasureName:                 string;
  unitOfMeasureAbbreviation:         string;
  patientLicenseNumber:              string;
  itemFromFacilityLicenseNumber:     string;
  itemFromFacilityName:              string;
  itemStrainName:                    null;
  note:                              string;
  packagedDate:                      string;
  initialLabTestingState:            string;
  labTestingState:                   string;
  labTestingStateDate:               string;
  isProductionBatch:                 boolean;
  productionBatchNumber:             string;
  sourceProductionBatchNumbers:      string;
  isTradeSample:                     boolean;
  isTradeSamplePersistent:           boolean;
  isDonation:                        boolean;
  isDonationPersistent:              boolean;
  sourcePackageIsDonation:           boolean;
  isTestingSample:                   boolean;
  isProcessValidationTestingSample:  boolean;
  productRequiresRemediation:        boolean;
  containsRemediatedProduct:         boolean;
  remediationDate:                   string;
  receivedDateTime:                  string;
  receivedFromManifestNumber:        string;
  receivedFromFacilityLicenseNumber: string;
  receivedFromFacilityName:          string;
  isOnHold:                          boolean;
  archivedDate:                      null;
  finishedDate:                      string;
  lastModified:                      string;
  remainingCount:                    number;
  inventoryImported:                 boolean;
  metrcItemID:                       number;
  productID:                         string;
  productName:                       string;
  productCategoryName:               string;
  item:                              Item;
  active                            : number;
}

export interface Item {
  id:                                  number;
  name:                                string;
  productCategoryName:                 string;
  productCategoryType:                 string;
  quantityType:                        string;
  defaultLabTestingState:              string;
  unitOfMeasureName:                   string;
  approvalStatus:                      string;
  approvalStatusDateTime:              string;
  strainId:                            number;
  strainName:                          string;
  administrationMethod:                string;
  unitCbdPercent:                      null;
  unitCbdContent:                      null;
  unitCbdContentUnitOfMeasureName:     null;
  unitCbdContentDose:                  null;
  unitCbdContentDoseUnitOfMeasureName: null;
  unitThcPercent:                      null;
  unitThcContent:                      null;
  unitThcContentUnitOfMeasureName:     null;
  unitThcContentDose:                  null;
  unitThcContentDoseUnitOfMeasureName: null;
  unitVolume:                          null;
  unitVolumeUnitOfMeasureName:         null;
  unitWeight:                          null;
  unitWeightUnitOfMeasureName:         null;
  servingSize:                         string;
  supplyDurationDays:                  null;
  numberOfDoses:                       null;
  unitQuantity:                        null;
  unitQuantityUnitOfMeasureName:       null;
  publicIngredients:                   string;
  description:                         string;
  isUsed:                              boolean;
}



// Generated by https://quicktype.io
export interface METRCPackageTypes {}

// Generated by https://quicktype.io

export interface METRCPackagesAdjustReasonsGet {
  Name:         string;
  RequiresNote: boolean;
}

// Generated by https://quicktype.io

export interface METRCPackagesCreatePOST {
  Tag:                        string;
  Location:                   null;
  Item:                       null | string;
  Quantity:                   number;
  UnitOfMeasure:              string;
  PatientLicenseNumber:       string;
  Note:                       null | string;
  IsProductionBatch:          boolean;
  ProductionBatchNumber:      null | string;
  IsDonation:                 boolean;
  ProductRequiresRemediation: boolean;
  UseSameItem:                boolean;
  ActualDate:                 string;
  Ingredients:                Ingredient[];
}

export interface Ingredient {
  Package:       string;
  Quantity:      number;
  UnitOfMeasure: string;
}

// Generated by https://quicktype.io

export interface METRCPackagesCreateTesting {
  Tag:                        string;
  Location:                   null;
  Item:                       null | string;
  Quantity:                   number;
  UnitOfMeasure:              string;
  PatientLicenseNumber:       string;
  Note:                       null | string;
  IsProductionBatch:          boolean;
  ProductionBatchNumber:      null | string;
  IsDonation:                 boolean;
  ProductRequiresRemediation: boolean;
  UseSameItem:                boolean;
  ActualDate:                 string;
  Ingredients:                Ingredient[];
}

export interface Ingredient {
  Package:       string;
  Quantity:      number;
  UnitOfMeasure: string;
}


// Generated by https://quicktype.io

export interface METRCPackagesCreatePlantings {
  PackageLabel:                       string;
  PackageAdjustmentAmount:            number | null;
  PackageAdjustmentUnitOfMeasureName: null | string;
  PlantBatchName:                     string;
  PlantBatchType:                     string;
  PlantCount:                         number;
  LocationName:                       null | string;
  StrainName:                         string;
  PatientLicenseNumber:               string;
  PlantedDate:                        string;
  UnpackagedDate:                     string;
}

// Generated by https://quicktype.io

export interface METRCPacakgesChangeItem {
  Label: string;
  Item:  string;
}

// Generated by https://quicktype.io

export interface METRCPackagesChangeNote {
  PackageLabel: string;
  Note:         string;
}

// Generated by https://quicktype.io

export interface METRCPackagesChangeLocations {
  Label:    string;
  Location: string;
  MoveDate: string;
}

// Generated by https://quicktype.io

export interface METRCPacakgesAdjust {
  Label:            string;
  Quantity:         number;
  UnitOfMeasure:    string;
  AdjustmentReason: string;
  AdjustmentDate:   string;
  ReasonNote:       null | string;
}

// Generated by https://quicktype.io

export interface METRCPackagesFinish {
  Label:      string;
  ActualDate: string;
}

// Generated by https://quicktype.io

export interface METRCPackagesUnfinish {
  Label: string;
}

// Generated by https://quicktype.io

export interface METRCPackagesRemediate {
  PackageLabel:          string;
  RemediationMethodName: string;
  RemediationDate:       string;
  RemediationSteps:      string;
}
