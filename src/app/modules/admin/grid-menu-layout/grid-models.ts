import { GridType } from "angular-gridster2";
import { ClientType } from "src/app/_interfaces/menu/price-schedule";

export interface GridsterSettings {
  swap             : boolean;
  swapWhileDragging: boolean;
  pushItems        : boolean;
  gridType         : string;
}

export interface WidgetModel {
  name: string;
  identifier: string;
  icon  : string;
  type  : string;
}
export interface DashboardModel {
  id: number;
  userName: string;
  name: string;
  active: boolean;
  type: string;  //preset types, menu, report widget, restaurant/ operation layout.
  jsonObject: string;
  dashboard: Array<DashboardContentModel>;
  errorMessage: string;
  widgetRolesJSON: string;
  widgetRoles: widgetRoles[]
}

export interface  DashBoardProperties {
  backgroundColor: string;
  image          : string;
  opacity        : number;
  backgroundblendmode : string;
  icon:           string;
  gridColumns    : number;
  gridRows       : number;
  pixelHeight    : string;
  pixelWidth     : string;
  mobileBreakpoint: number,
}

export interface DashboardContentModel {
  id: number;
  component?: any;
  componentName: string;
  name: string;
  cols: number;
  rows: number;
  y: number;
  x: number;
  properties?: any;// DashBoardComponentProperties ; // json object
  object: DashBoardComponentProperties;
  layerIndex: any;
}

//not stored in database as table.
export interface DashBoardComponentProperties {
  id             : number;
  name           : string;
  roles          : widgetRoles[]
  menuType       : string;
  listItemID     : string;
  opacity        : number;
  borderRadius   : number;
  border         : number;
  layerIndex     : number;

  lengthOfRange  : string; //number of range month, year etc
  rangeType      : string; //hour, month, day, year
  type           : string; //preset types, menu, report widget
  cardValueType  : string; //componentName
  dateFrom       : string; //not implemented
  dateTo         : string; //not implemented
  chartType      : string;

  MMJMenu        : boolean;
  chartHeight    : string;
  chartWidth     : string;
  itemID         : string;

  disableActions : boolean;
  autoPlay       : boolean;
  url            : string;
  autoRepeat     : boolean;

  refreshTime    : number;
  rangeValue     : number;
  dateRangeReport: boolean;
  productName    : string;
}

export interface widgetRoles {
  id          : number;
  clientTypeID: number;
  name:            string;
}

// export const WidgetsMock: WidgetModel[] = [
//   {
//       name: 'Radar Chart',
//       identifier: 'radar_chart'

//   },
//   {
//       name: 'Doughnut Chart',
//       identifier: 'doughnut_chart'
//   },
//   {
//       name: 'Line Chart',
//       identifier: 'line_chart'
//   }
// ]
