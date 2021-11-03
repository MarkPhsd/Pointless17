export interface IOrderItem {
    ID:number;
    productName:string;
    sKU:string;
    orderID:number;
    productID:number;
    quantity:number;
    itemTotal:number;
    unitName:string;
    unitPrice:number;
}


export interface ISalesDates {
    amountPaid: number|null;
}

export interface ISalesDate {
    dateCompleted: string;
    amountPaid: number|null;
    count: number|null;
    siteID: number|null;
}

export interface ISalesValues {
    amountPaid: number|null;
}

export interface ISalesPayments {
    dateCompleted: string;
    timeCompleted: string;
    amountPaid: number|null;
    siteID: number|null;
    count: number|null;
    hour: number|null;
    month: number|null;
    serverName: string;
    dateHour: string;
}


export interface ISalesReportingOrdersSummary {
    dateCompleted: string;
    timeCompleted: string;
    amountPaid: number|null;
    siteID: number|null;
    count: number|null;
    hour: number|null;
    month: number|null;
    serverName: string;
    dateHour: string;
    taxTotal: number|null;
    taxTotal2: number|null;
    taxTotal3: number|null;
    GSTTaxTotal: number|null;
    orderTotal: number|null;
}

