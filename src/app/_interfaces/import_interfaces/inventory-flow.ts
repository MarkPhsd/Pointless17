export interface FlowInventory {
  
  supplier : string;
  invoice : string;
  room : string;
  type : string;
  terpenes : string;
  expDate : string;
  currentQuantity : number;
  sku : string;
  initialQuantity : number;
  features : string;
  startOfDayQuantity : number;
  labelInfo : string;
  categoryname : string;
  price : string;
  unitOfMeasure : string;
  createdAtDate : string;
  createdAtTime : string;
  lastAuditDate : string;
  lastAuditTime : string;
  packageID : string;
  weightPerUnit : string;
  weightPerUnitOunce : string;
  weighUnitPrePackagedFlower : string;
  jointWeight : string;
  nonStandardWeight : string;
  dosageText : string;
  calculatedWeightGrams : number;
  productName : string;
  brand : string;
  strainName : string;
  sourceLicense : string;
  batchID  : number;
  batchDate : string;
  testDate : string;
  testedBy : string;
  testLotNumber : string;
  cost : number;
  thcPercentage : number;
  cbdPercentage : number;
  totalCost : number;
  totalPrice : number;
  locationDisplay : string;
  transferDestination : string;
  form : string;
  description : string;
  message : string;
}

export interface ImportFlowInventoryResults { 
  listNotAdded: FlowInventory[];
  listAdded   : FlowInventory[]
}