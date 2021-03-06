import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import {
  AppResponseModel, ComponentModel, FeaturesResponseModel, LayerDetailsModel, MapResponseModel, Sortorder, VersionResponseModel,
} from '../models';
import { Observable } from 'rxjs';
import { TailormapApiV1ServiceModel } from './tailormap-api-v1.service.model';

@Injectable()
export class TailormapApiV1Service implements TailormapApiV1ServiceModel {

  public static BASE_URL = '/api';

  constructor(
    private httpClient: HttpClient,
  ) {
  }

  public getVersion$(): Observable<VersionResponseModel> {
    return this.httpClient.get<VersionResponseModel>(
      `${TailormapApiV1Service.BASE_URL}/version`,
    );
  }

  public getApplication$(params: {
    name?: string;
    version?: string;
    id?: number;
  }): Observable<AppResponseModel> {
    return this.httpClient.get<AppResponseModel>(
      `${TailormapApiV1Service.BASE_URL}/app`,
      { params: this.getQueryParams({ id: params.id, name: params.name, version: params.version }) },
    );
  }

  public getMap$(applicationId: number): Observable<MapResponseModel> {
    return this.httpClient.get<MapResponseModel>(
      `${TailormapApiV1Service.BASE_URL}/app/${applicationId}/map`,
    );
  }

  public getComponents$(applicationId: number): Observable<ComponentModel[]> {
    return this.httpClient.get<ComponentModel[]>(
      `${TailormapApiV1Service.BASE_URL}/app/${applicationId}/components`,
    );
  }

  public getDescribeLayer$(params: {
    applicationId: number;
    layerId: number;
  }): Observable<LayerDetailsModel> {
    return this.httpClient.get<LayerDetailsModel>(
      `${TailormapApiV1Service.BASE_URL}/app/${params.applicationId}/layer/${params.layerId}/describe`,
    );
  }

  public getFeatures$(params: {
    applicationId: number;
    layerId: number;
    x?: number;
    y?: number;
    crs?: string;
    distance?: number;
    __fid?: string;
    simplify?: boolean;
    filter?: string;
    page?: number;
    sortBy?: string;
    sortOrder?: Sortorder;
  }): Observable<FeaturesResponseModel> {
    const queryParams = this.getQueryParams({
      x: params.x,
      y: params.y,
      crs: params.crs,
      distance: params.distance,
      __fid: params.__fid,
      simplify: params.simplify,
      filter: params.filter,
      page: params.page,
      sortBy: params.sortBy,
      sortOrder: params.sortOrder,
    });
    return this.httpClient.get<FeaturesResponseModel>(
      `${TailormapApiV1Service.BASE_URL}/app/${params.applicationId}/layer/${params.layerId}/features`,
      { params: queryParams },
    );
  }

  private getQueryParams(params: Record<string, string | number | boolean | undefined>): HttpParams {
    let queryParams = new HttpParams();
    Object.keys(params).forEach(key => {
      const value = params[key];
      if (typeof value !== 'undefined') {
        queryParams = queryParams = queryParams.set(key, value);
      }
    });
    return queryParams;
  }

}
