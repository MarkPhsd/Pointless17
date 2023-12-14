import { Injectable } from '@angular/core';

export enum AvailabilityTypeEnum {
  IN_STOCK,
  OUT_OF_STOCK,
  SHIP_TO_STORE
}

export enum TimeDurationUnitEnum {
  YEAR,
  MONTH,
  DAY,
  HOUR,
  CALENDAR_DAY,
  BUSINESS_DAY,
  MINUTE,
  SECOND,
  MILLISECOND
}


export enum ConditionEnum {
  NEW,
  LIKE_NEW,
  // ... other conditions
}

export enum LengthUnitOfMeasureEnum {
  INCH,
  FEET,
  CENTIMETER,
  METER
}

export enum PackageTypeEnum {
  LETTER,
  BULKY_GOODS,
  WINE_PAK,
  // ... other package types
}

export enum WeightUnitOfMeasureEnum {
  POUND,
  KILOGRAM,
  OUNCE,
  GRAM
}

export interface FulfillmentTime {
  unit: TimeDurationUnitEnum;
  value: number;
}

export interface PickupAtLocationAvailability {
  availabilityType: AvailabilityTypeEnum;
  fulfillmentTime: FulfillmentTime;
  merchantLocationKey: string;
  quantity: number;
}

export interface ShipToLocationAvailabilityDistribution {
  fulfillmentTime: FulfillmentTime;
  merchantLocationKey: string;
  quantity: number;
}

export interface ShipToLocationAvailability {
  availabilityDistributions: ShipToLocationAvailabilityDistribution[];
  quantity: number;
}

export interface ConditionDescriptor {
  additionalInfo: string;
  name: string;
  values: string[];
}

export interface Dimensions {
  height: number;
  length: number;
  unit: LengthUnitOfMeasureEnum;
  width: number;
}

export interface Weight {
  unit: WeightUnitOfMeasureEnum;
  value: number;
}

export interface PackageWeightAndSize {
  dimensions: Dimensions;
  packageType: PackageTypeEnum;
  weight: Weight;
}

export interface Product {
  aspects: string;
  brand: string;
  description: string;
  ean: string[];
  epid: string;
  imageUrls: string[];
  isbn: string[];
  mpn: string;
  subtitle: string;
  title: string;
  upc: string[];
  videoIds: string[];
}

export interface ProductData {
  availability: {
    pickupAtLocationAvailability: PickupAtLocationAvailability[];
    shipToLocationAvailability: ShipToLocationAvailability;
  };
  condition: ConditionEnum;
  conditionDescription: string;
  conditionDescriptors: ConditionDescriptor[];
  packageWeightAndSize: PackageWeightAndSize;
  product: Product;
}

@Injectable({
  providedIn: 'root'
})
export class EbayAPIService {

  constructor() { }
    // false
    // '-- also called Client ID --',
    // '-- also called Client Secret --',

}
