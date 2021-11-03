
import { MatTableDataSource } from '@angular/material/table';
import { ISalesPayments, ISalesReportingOrdersSummary,  } from './';

export interface ISite {

    id:      number;
    name:    string;
    url:     string;
    imgName: string;
    address: string;
    city:    string;
    state:   string;
    zip:     string;
    phone:   string;
    metrcURL: string;
    metrcLicenseNumber: string;
    metrcKey: string;
    metrcUser: string;

    salesData?: ISalesPayments[] | MatTableDataSource<ISalesPayments>;
    salesOrderSummary?: ISalesReportingOrdersSummary[] | MatTableDataSource<ISalesReportingOrdersSummary>;
    status: string;

    userLoyaltyPoints: number;
    userTotalPurchases: number;
}
