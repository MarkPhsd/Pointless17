export interface METRCCustomerTypeGet {}

export interface METRCSalesDeliveries {
  Id:                              number;
  DeliveryNumber:                  null;
  SalesDateTime:                   string;
  SalesCustomerType:               string;
  PatientLicenseNumber:            null;
  ConsumerId:                      string;
  DriverName:                      string;
  DriverOccupationalLicenseNumber: string;
  DriverVehicleLicenseNumber:      string;
  VehicleMake:                     string;
  VehicleModel:                    string;
  VehicleLicensePlateNumber:       string;
  RecipientName:                   null;
  PlannedRoute:                    string;
  EstimatedDepartureDateTime:      string;
  EstimatedArrivalDateTime:        string;
  ActualArrivalDateTime:           null;
  TotalPackages:                   number;
  TotalPrice:                      number;
  Transactions:                    any[];
  CompletedDateTime:               null;
  SalesDeliveryState:              number;
  VoidedDate:                      null;
  RecordedDateTime:                string;
  RecordedByUserName:              null;
  LastModified:                    string;
}


export interface METRCSalesDeliveryReturnReasonsGET {
  Name:         string;
  RequiresNote: boolean;
}

export interface METRCSalesDeliveriesPOST {
  SalesDateTime:                   string;
  SalesCustomerType:               string;
  PatientLicenseNumber:            null;
  ConsumerId:                      null;
  DriverName:                      string;
  DriverOccupationalLicenseNumber: string;
  DriverVehicleLicenseNumber:      string;
  PhoneNumberForQuestions:         string;
  VehicleMake:                     string;
  VehicleModel:                    string;
  VehicleLicensePlateNumber:       string;
  RecipientName:                   null;
  RecipientAddressStreet1:         string;
  RecipientAddressStreet2:         string;
  RecipientAddressCity:            string;
  RecipientAddressState:           string;
  RecipientAddressPostalCode:      string;
  PlannedRoute:                    string;
  EstimatedDepartureDateTime:      string;
  EstimatedArrivalDateTime:        string;
  Transactions:                    Transaction[];
}

export interface Transaction {
  PackageLabel:  string;
  Quantity:      number;
  UnitOfMeasure: string;
  TotalAmount:   number;
}

// Generated by https://quicktype.io

export interface METRCSalesDeliveriesPUT {
  Id:                              number;
  SalesDateTime:                   string;
  SalesCustomerType:               string;
  PatientLicenseNumber:            null;
  ConsumerId:                      null;
  DriverName:                      string;
  DriverOccupationalLicenseNumber: string;
  DriverVehicleLicenseNumber:      string;
  PhoneNumberForQuestions:         string;
  VehicleMake:                     string;
  VehicleModel:                    string;
  VehicleLicensePlateNumber:       string;
  RecipientName:                   null;
  RecipientAddressStreet1:         string;
  RecipientAddressStreet2:         string;
  RecipientAddressCity:            string;
  RecipientAddressState:           string;
  RecipientAddressPostalCode:      string;
  PlannedRoute:                    string;
  EstimatedDepartureDateTime:      string;
  EstimatedArrivalDateTime:        string;
  Transactions:                    Transaction[];
}

export interface Transaction {
  PackageLabel:  string;
  Quantity:      number;
  UnitOfMeasure: string;
  TotalAmount:   number;
}

// Generated by https://quicktype.io

export interface METRCSalesDeliveriesCompletePUT {
  Id:                    number;
  ActualArrivalDateTime: string;
  AcceptedPackages:      string[];
  ReturnedPackages:      ReturnedPackage[];
}

export interface ReturnedPackage {
  Label:                  string;
  ReturnQuantityVerified: number;
  ReturnUnitOfMeasure:    string;
  ReturnReason:           string;
  ReturnReasonNote:       string;
}

export interface METRCSalesReceipts {
  Id:                     number;
  ReceiptNumber:          null;
  SalesDateTime:          string;
  SalesCustomerType:      string;
  PatientLicenseNumber:   null;
  CaregiverLicenseNumber: null;
  IdentificationMethod:   null;
  TotalPackages:          number;
  TotalPrice:             number;
  Transactions:           any[];
  IsFinal:                boolean;
  ArchivedDate:           null;
  RecordedDateTime:       string;
  RecordedByUserName:     null;
  LastModified:           string;
}

// Generated by https://quicktype.io

export interface METRCSalesReceiptsPOSTPUT {
  ID:                     number;
  SalesDateTime:          string;
  SalesCustomerType:      string;
  PatientLicenseNumber:   null;
  CaregiverLicenseNumber: null;
  IdentificationMethod:   null;
  Transactions:           Transaction[];
}

export interface Transaction {
  PackageLabel:  string;
  Quantity:      number;
  UnitOfMeasure: string;
  TotalAmount:   number;
}

export interface METRCSalesTransactionsGET {
  SalesDate:         string;
  TotalTransactions: number;
  TotalPackages:     number;
  TotalPrice:        number;
}

export interface METRCSalesTransactionsGET {
  PackageId:                               number;
  PackageLabel:                            string;
  ProductName:                             string;
  ProductCategoryName:                     null;
  ItemStrainName:                          null;
  ItemUnitCbdPercent:                      null;
  ItemUnitCbdContent:                      null;
  ItemUnitCbdContentUnitOfMeasureName:     null;
  ItemUnitCbdContentDose:                  null;
  ItemUnitCbdContentDoseUnitOfMeasureName: null;
  ItemUnitThcPercent:                      null;
  ItemUnitThcContent:                      null;
  ItemUnitThcContentUnitOfMeasureName:     null;
  ItemUnitThcContentDose:                  null;
  ItemUnitThcContentDoseUnitOfMeasureName: null;
  ItemUnitVolume:                          null;
  ItemUnitVolumeUnitOfMeasureName:         null;
  ItemUnitWeight:                          null;
  ItemUnitWeightUnitOfMeasureName:         null;
  ItemServingSize:                         null;
  ItemSupplyDurationDays:                  null;
  ItemUnitQuantity:                        null;
  ItemUnitQuantityUnitOfMeasureName:       null;
  QuantitySold:                            number;
  UnitOfMeasureName:                       string;
  UnitOfMeasureAbbreviation:               string;
  TotalPrice:                              number;
  SalesDeliveryState:                      null;
  ArchivedDate:                            null;
  RecordedDateTime:                        string;
  RecordedByUserName:                      null;
  LastModified:                            string;
}

// Generated by https://quicktype.io

export interface METRCSalesTransactionsPOST {
  PackageLabel:  string;
  Quantity:      number;
  UnitOfMeasure: string;
  TotalAmount:   number;
}

// Generated by https://quicktype.io

export interface METRCSalesTransactionsPUT {
  PackageLabel:  string;
  Quantity:      number;
  UnitOfMeasure: string;
  TotalAmount:   number;
}
