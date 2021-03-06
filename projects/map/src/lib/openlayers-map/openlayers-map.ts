/* eslint-disable rxjs/finnish */
import { default as OlMap } from 'ol/Map';
import Projection from 'ol/proj/Projection';
import View from 'ol/View';
import { NgZone } from '@angular/core';
import { defaults as defaultInteractions } from 'ol/interaction';
import { LayerManagerModel, MapResolutionModel, MapViewerModel, MapViewerOptionsModel } from '../models';
import { ProjectionsHelper } from '../helpers/projections.helper';
import { OpenlayersExtent } from '../models/extent.type';
import { OpenLayersLayerManager } from './open-layers-layer-manager';
import { BehaviorSubject, concatMap, filter, map, merge, Observable, take, tap } from 'rxjs';
import { Size } from 'ol/size';
import { ToolManagerModel } from '../models/tool-manager.model';
import { OpenLayersToolManager } from './open-layers-tool-manager';
import { OpenLayersEventManager } from './open-layers-event-manager';
import { MapExportOptions } from '../map-service/map.service';
import { OpenLayersMapImageExporter } from './openlayers-map-image-exporter';
import Feature from 'ol/Feature';
import Geometry from 'ol/geom/Geometry';
import { buffer } from 'ol/extent';

export class OpenLayersMap implements MapViewerModel {

  private map: BehaviorSubject<OlMap | null> = new BehaviorSubject<OlMap | null>(null);
  private layerManager: BehaviorSubject<LayerManagerModel | null> = new BehaviorSubject<LayerManagerModel | null>(null);
  private toolManager: BehaviorSubject<ToolManagerModel | null> = new BehaviorSubject<ToolManagerModel | null>(null);

  private readonly resizeObserver: ResizeObserver;
  private initialExtent: OpenlayersExtent = [];

  constructor(
    private ngZone: NgZone,
  ) {
    this.resizeObserver = new ResizeObserver(() => this.updateMapSize());
  }

  public initMap(options: MapViewerOptionsModel) {
    if (this.map.value && this.map.value.getView().getProjection().getCode() === options.projection) {
      // Do not re-create the map if the projection is the same as previous
      this.map.value.getView().getProjection().setExtent(options.maxExtent);
      if (options.initialExtent && options.initialExtent.length > 0) {
        this.map.value.getView().fit(options.initialExtent);
      }
      return;
    }

    ProjectionsHelper.initProjection(options.projection, options.projectionDefinition, options.projectionAliases);
    const projection = new Projection({
      code: options.projection,
      extent: options.maxExtent,
    });
    const resolutions = ProjectionsHelper.getResolutions(options.projection, options.maxExtent);

    const view = new View({
      projection,
      resolutions,
    });

    const olMap = new OlMap({
      controls: [],
      interactions: defaultInteractions({
        altShiftDragRotate: false,
        pinchRotate: false,
      }),
      view,
    });

    this.initialExtent = options.initialExtent && options.initialExtent.length > 0
      ? options.initialExtent
      : options.maxExtent;

    if (this.toolManager.value) {
      this.toolManager.value.destroy();
    }

    if (this.toolManager.value) {
      this.toolManager.value.destroy();
    }

    if (this.map.value) {
      this.map.value.dispose();
    }

    const layerManager = new OpenLayersLayerManager(olMap);
    layerManager.init();
    const toolManager = new OpenLayersToolManager(olMap, this.ngZone);
    OpenLayersEventManager.initEvents(olMap, this.ngZone);

    this.map.next(olMap);
    this.layerManager.next(layerManager);
    this.toolManager.next(toolManager);
  }

  public render(container: HTMLElement) {
    this.ngZone.runOutsideAngular(this._render.bind(this, container));
  }

  public getLayerManager$(): Observable<LayerManagerModel> {
    const isLayerManager = (item: LayerManagerModel | null): item is LayerManagerModel => item !== null;
    return this.layerManager.asObservable().pipe(filter(isLayerManager));
  }

  public getToolManager$(): Observable<ToolManagerModel> {
    const isToolManager = (item: ToolManagerModel | null): item is ToolManagerModel => item !== null;
    return this.toolManager.asObservable().pipe(filter(isToolManager));
  }

  public getVisibleExtent$(): Observable<OpenlayersExtent> {
    return this.getSize$().pipe(
      concatMap(size => this.getMap$().pipe(
        map(olMap => olMap.getView().calculateExtent(size)),
      )),
    );
  }

  public setZoomLevel(zoom: number) {
    this.executeMapAction(olMap => olMap.getView().setZoom(zoom));
  }

  public zoomIn() {
    this.executeMapAction(olMap => {
      olMap.getView().setZoom((olMap.getView().getZoom() || 0) + 1);
    });
  }

  public zoomOut() {
    this.executeMapAction(olMap => {
      olMap.getView().setZoom((olMap.getView().getZoom() || 0) - 1);
    });
  }

  public zoomToInitialExtent() {
    this.executeMapAction(olMap => {
      if (this.initialExtent && this.initialExtent.length > 0) {
        olMap.getView().fit(this.initialExtent);
      }
    });
  }

  public zoomToFeature(olFeature: Feature<Geometry>) {
    const geom = olFeature.getGeometry();
    if (geom) {
      const geomExtent = geom.getExtent();
      this.executeMapAction(olMap => {
        olMap.getView().fit(buffer(geomExtent, 10), { duration: 1000 });
      });
    }
  }

  public zoomTo(x: number, y: number, zoomLevel?: number, animationDuration = 1000, ignoreWhileAnimating = false) {
    this.executeMapAction(olMap => {
      if (olMap.getView().getAnimating() && ignoreWhileAnimating) {
        return;
      }
      zoomLevel = !(zoomLevel) || zoomLevel < 0 ? olMap.getView().getZoom() : zoomLevel;
      if (typeof zoomLevel === 'undefined') {
        return;
      }
      if (animationDuration === 0) {
        olMap.getView().setCenter([x, y]);
        olMap.getView().setZoom(zoomLevel);
      } else {
        olMap.getView().animate({ duration: animationDuration, zoom: zoomLevel, center: [x, y] });
      }
    });
  }

  public getMap$(): Observable<OlMap> {
    const isNotNullMap = (item: OlMap | null): item is OlMap => item !== null;
    return this.map.asObservable().pipe(filter(isNotNullMap));
  }

  public executeMapAction(fn: (olMap: OlMap) => void) {
    this.getMap$()
      .pipe(take(1))
      .subscribe(olMap => fn(olMap));
  }

  public getProjection$(): Observable<Projection> {
    return this.getMap$().pipe(map(olMap => olMap.getView().getProjection()));
  }

  public getPixelForCoordinates$(coordinates: [number, number]): Observable<[number, number] | null> {
    return merge(
      this.getMap$(),
      OpenLayersEventManager.onMapMove$().pipe(map(evt => evt.map)))
        .pipe(
          map(olMap => {
            const px = olMap.getPixelFromCoordinate(coordinates);
            if (!px) {
              return null;
            }
            return [px[0], px[1]];
          }),
        );
  }

  public getResolution$(): Observable<MapResolutionModel> {
    return merge(
      this.getMap$(),
      OpenLayersEventManager.onMapMove$().pipe(map(evt => evt.map)))
      .pipe(
        map(olMap => {
          const view = olMap.getView();
          return {
            zoomLevel: view.getZoom() || 0,
            minZoomLevel: view.getMinZoom() || 0,
            maxZoomLevel: view.getMaxZoom() || 0,
            resolution: view.getResolution() || 0,
            minResolution: view.getMinResolution() || 0,
            maxResolution: view.getMaxResolution() || 0,
          };
        }),
      );
  }

  public exportMapImage$(options: MapExportOptions): Observable<string> {
    return this.getMap$().pipe(
      take(1),
      tap((olMap: OlMap) => console.log(olMap)),
      concatMap((olMap: OlMap) => {
        // XXX maybe provide an extension point for DrawingComponent to provide layer instances for map image export, or ask the LayerManager
        // for VectorLayers that should be included in a map image export?
        const drawingLayer = olMap.getAllLayers().find(l => l.get('id') === 'drawing-layer');
        return OpenLayersMapImageExporter.exportMapImage$(olMap.getSize() as Size, olMap.getView(), options, drawingLayer ? [drawingLayer] : []).pipe(
          // Force redraw of vector layer with normal DPI
          tap(() => drawingLayer?.changed()),
        );
      }),
    );
  }

  private getSize$(): Observable<Size> {
    return this.getMap$().pipe(map(olMap => {
      const size = olMap.getSize();
      if (!size) {
        return [ 0, 0 ];
      }
      return size;
    }));
  }

  private _render(container: HTMLElement) {
    this.executeMapAction(olMap => {
      olMap.setTarget(container);
      olMap.render();
      if (this.initialExtent && this.initialExtent.length > 0) {
        olMap.getView().fit(this.initialExtent);
      }
      window.setTimeout(() => this.updateMapSize(), 0);
      this.resizeObserver.observe(container);
    });
  }

  private updateMapSize() {
    this.executeMapAction(olMap => {
      olMap.updateSize();
    });
  }
}
