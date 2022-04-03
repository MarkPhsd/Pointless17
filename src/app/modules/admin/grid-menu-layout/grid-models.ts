export interface WidgetModel {
  name: string;
  identifier: string;
}

export interface DashboardModel {
  id: number;
  userName: string;
  roles: widgetRoles[]
  name: string;
  active: boolean;
  type: string;  //preset types, menu, report widget, restaurant/ operation layout.
  jsonObject: string;
  dashboard: Array<DashboardContentModel>;
}

export interface  DashBoardProperties {
  backgroundColor: string;
  image          : string;
  opacity        : number;
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
  object: DashBoardComponentProperties
}

//not stored in database as table.
export interface DashBoardComponentProperties {
  id             : number;
  name           : string;
  roles          : widgetRoles[]
  lengthOfRange  : string;     //number of range month, year etc
  rangeType      : string;        //hour, month, day, year
  type           : string; //preset types, menu, report widget
  cardValueType  : string;
  dateFrom       : string;
  dateTo         : string;
  menuType       : string;
  listItemID     : string;
}

export interface widgetRoles {
  id          : number;
  clientTypeID: number;
}

export const WidgetsMock: WidgetModel[] = [
  {
      name: 'Radar Chart',
      identifier: 'radar_chart'
  },
  {
      name: 'Doughnut Chart',
      identifier: 'doughnut_chart'
  },
  {
      name: 'Line Chart',
      identifier: 'line_chart'
  }
]
