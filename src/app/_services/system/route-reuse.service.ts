import {
  RouteReuseStrategy,  ActivatedRouteSnapshot,  DetachedRouteHandle,   RouterModule,   Routes,   UrlSegment
} from '@angular/router';

export class RouteReuseService implements RouteReuseStrategy {

  private handlers: { [key: string]: DetachedRouteHandle } = {};

  shouldDetach(route: ActivatedRouteSnapshot): boolean {
    if (!route.routeConfig || route.routeConfig.loadChildren) {
      return false;
    }
    let shouldReuse = false;
    // console.log('checking if this route should be re used or not', route);
    if (route.routeConfig.data) {
      route.routeConfig.data.reuse ? shouldReuse = true : shouldReuse = false;
    }
    return shouldReuse;
  }

  store(route: ActivatedRouteSnapshot, handler: DetachedRouteHandle): void {
    console.log('storing handler');
    if (handler) {
      this.handlers[this.getUrl(route)] = handler;
    }
  }

  shouldAttach(route: ActivatedRouteSnapshot): boolean {
    console.log('checking if it should be re attached1');
    return !!this.handlers[this.getUrl(route)];
  }

  retrieve(route: ActivatedRouteSnapshot): DetachedRouteHandle {
    if (!route.routeConfig || route.routeConfig.loadChildren) {
      return null;
    };
    return this.handlers[this.getUrl(route)];
  }

  shouldReuseRoute(future: ActivatedRouteSnapshot, current: ActivatedRouteSnapshot): boolean {
    let reUseUrl = false;
    if (future.routeConfig) {
      if (future.routeConfig.data) {
        reUseUrl = future.routeConfig.data.reuse;
      }
    }
    const defaultReuse = (future.routeConfig === current.routeConfig);
    return reUseUrl || defaultReuse;
  }

  getUrl(route: ActivatedRouteSnapshot): string {
    if (route.routeConfig) {
      const url = route.routeConfig.path;
      console.log('returning url', url);
      return url;
    }
  }

}
