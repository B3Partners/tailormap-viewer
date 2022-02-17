import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { AppLayerModel, AppResponseModel, ComponentModel, LayerDetailsModel, MapResponseModel } from '../models';
import { Observable } from 'rxjs';
import { TailormapApiV1ServiceModel } from './tailormap-api-v1.service.model';
import { FeaturesResponseModel } from '../models/features-response.model';

@Injectable()
export class TailormapApiV1Service implements TailormapApiV1ServiceModel {

  private static BASE_URL = '/api';

  constructor(
    private httpClient: HttpClient,
  ) {
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
      `${TailormapApiV1Service.BASE_URL}/${applicationId}/map`,
    );
  }

  public getComponents$(applicationId: number): Observable<ComponentModel[]> {
    return this.httpClient.get<ComponentModel[]>(
      `${TailormapApiV1Service.BASE_URL}/${applicationId}/components`,
    );
  }

  public getLayers$(applicationId: number): Observable<AppLayerModel[]> {
    return this.httpClient.get<AppLayerModel[]>(
      `${TailormapApiV1Service.BASE_URL}/${applicationId}/layers`,
    );
  }

  public getDescribeLayer$(params: {
    applicationId: number;
    layerId: number;
  }): Observable<LayerDetailsModel> {
    return this.httpClient.get<LayerDetailsModel>(
      `${TailormapApiV1Service.BASE_URL}/${params.applicationId}/describelayer/${params.layerId}`,
    );
  }

  public getFeatures$(params: {
    applicationId: number;
    layerId: number;
    x?: number;
    y?: number;
    distance?: number;
    __fid?: string;
    simplify?: boolean;
    filter?: string;
  }): Observable<FeaturesResponseModel> {
    const queryParams = this.getQueryParams({
      x: params.x,
      y: params.y,
      distance: params.distance,
      __fid: params.__fid,
      simplify: params.simplify,
      filter: params.filter,
    });
    return this.httpClient.get<FeaturesResponseModel>(
      `${TailormapApiV1Service.BASE_URL}/${params.applicationId}/features/${params.layerId}`,
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
