import { Inject, Injectable } from '@angular/core';
import { FeaturesResponseModel, TAILORMAP_API_V1_SERVICE, TailormapApiV1ServiceModel } from '@tailormap-viewer/api';
import { Store } from '@ngrx/store';
import { selectApplicationId} from '../../state/core.selectors';
import { catchError, combineLatest, concatMap, forkJoin, map, Observable, of, take } from 'rxjs';
import { FeatureInfoResponseModel } from './models/feature-info-response.model';
import { $localize } from '@angular/localize/init';
import { selectVisibleLayersWithAttributes } from '../../map/state/map.selectors';

@Injectable({
  providedIn: 'root',
})
export class FeatureInfoService {

  private static LOAD_FEATURE_INFO_ERROR = $localize `Could not load feature info`;

  /**
   * default buffer distance for feature info requests in native CRS units, eg. m for EPSG:28992 or EPSG:3857.
   * For EPSG:4326 0.00004 would be a good value.
   */
  private static DEFAULT_DISTANCE = 4;

  constructor(
    private store$: Store,
    @Inject(TAILORMAP_API_V1_SERVICE) private apiService: TailormapApiV1ServiceModel,
  ) {
  }

  public getFeatures$(coordinates: [ number, number ]): Observable<FeatureInfoResponseModel[]> {
    return combineLatest([
      this.store$.select(selectVisibleLayersWithAttributes),
      this.store$.select(selectApplicationId),
    ])
      .pipe(
        take(1),
        concatMap(([ layers, applicationId ]) => {
          if (!applicationId || layers.length === 0) {
            return of([]);
          }
          const featureRequests$ = layers.map(layer => {
            const layerId = layer.id;
            return this.apiService.getFeatures$({
              layerId,
              applicationId,
              x: coordinates[0],
              y: coordinates[1],
              distance: FeatureInfoService.DEFAULT_DISTANCE,
              simplify: false,
            }).pipe(
              map((featureInfoResult: FeaturesResponseModel): FeatureInfoResponseModel => ({
                features: (featureInfoResult.features || []).map(feature => ({ ...feature, layerId })),
                columnMetadata: (featureInfoResult.columnMetadata || []).map(metadata => ({ ...metadata, layerId })),
                layerId,
              })),
              catchError((): Observable<FeatureInfoResponseModel> => {
                return of({
                  features: [],
                  columnMetadata: [],
                  layerId,
                  error: FeatureInfoService.LOAD_FEATURE_INFO_ERROR,
                });
              }),
            );
          });
          return forkJoin(featureRequests$);
        }),
      );
  }

}
