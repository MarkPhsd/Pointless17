export interface WidgetModel {
  name: string;
  identifier: string;
}

export interface DashboardModel {
  id: number;
  username: string;
  roles: widgetRoles[]
  name: string;
  type: string;  //preset types, menu, report widget, restaurant/ operation layout.
  dashboard: Array<DashboardContentModel>;
}

export interface DashboardContentModel {
  cols: number;
  rows: number;
  y: number;
  x: number;
  component?: any;
  name: string;
  id: number;
  properties: string ; // json object
}

//not stored in database as table.
export interface DashBoardComponentProperties {
  id   : number;
  name : string;
  roles: widgetRoles[]
  rangeType: string;        //hour, month, day, year
  lengtOfRange: string;     //number of range month, year etc
  type: string; //preset types, menu, report widget
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
