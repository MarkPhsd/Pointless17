export interface FlowProducts {
	createdAt	: string;
	productName : string;
	description : string;
	brand : string;
	cost : number;
	price : number;
	parLevel : number;
	labelInfo  : string;
	type : string;
	terpenes : string;
	priceCostMatrixId: number;
	matrixName : string;
	matrixDefaultPrice : number;
	matrixDefaultCost  : number;
	isMatrixPublished  : boolean;
	categoryName : string;
	mgTHC : string;
	mgCBD : string;
	hasImage : boolean;
	weight : string;
	measuredbyvolume  : boolean;
	liquidProduct  : boolean;
	childProof  : boolean;
	skU   : string;
	strainName  : string;
	tHC : string;
	cBD : string;
	isInhalableCannabinoid  : boolean;
  message : string;
}

export interface ImportFlowProductResults { 
  listNotAdded: FlowProducts[];
  listAdded   : FlowProducts[]
}

export interface FlowStrain { 
  createdAt : string;
  name : string;
  species : string;
  description
  thcUpper : string;
  thcLower : string;
  cbdUpper : string;
  cbdLower : string;
  cbnUpper : string;
  cbnLower : string;
  thcAUpper : string;
  thcALower : string;
  terpenes : string;
  metrcID  : number;
  testingStatus : string;
  isMed : boolean;
  isTransfering : boolean;
  message : string;
}


export interface ImportFlowStainsResults { 
  listNotAdded: FlowStrain[];
  listAdded   : FlowStrain[]
}

export interface FlowPrice {
  
 createdAt : string;
 name : string;
 description : string;
 gramsPrice : number;
 half8SPrice : number;
 eighthsPrice : number;
 quartersPrice : number;
 halfOsPrice : number;
 ouncesPrice : number;
 gramsPrimaryPrice : number;
 half8SPrimaryPrice : number;
 eighthsPrimaryPrice : number;
 quartersPrimaryPrice : number;
 halfOsPrimaryPrice : number;
 ouncesPrimaryPrice : number;
 locationId : string;
 stepPricing : boolean;
 mixAndMatch : boolean;
 noPackedStacking : boolean;
 stepThreshold : string;
 isMed : boolean;
 isTransfering : boolean;
 message : string;
}

export interface ImportFlowPriceResults { 
  listNotAdded: FlowPrice[];
  listAdded   : FlowPrice[]
}
