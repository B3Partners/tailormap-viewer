import BaseLayer from 'ol/layer/Base';
import Projection from 'ol/proj/Projection';
import TileLayer from 'ol/layer/Tile';
import WMTS, { optionsFromCapabilities } from 'ol/source/WMTS';
import XYZ from 'ol/source/XYZ';
import { TMSLayerModel } from '../models/tms-layer.model';
import { LayerTypesHelper } from './layer-types.helper';
import { OgcHelper } from './ogc.helper';
import { LayerModel } from '../models/layer.model';
import { WMSLayerModel } from '../models/wms-layer.model';
import { WMTSLayerModel } from '../models/wmts-layer.model';
import { WMTSCapabilities } from 'ol/format';
import WMTSTileGrid from 'ol/tilegrid/WMTS';
import { ImageWMS, TileWMS } from 'ol/source';
import ImageLayer from 'ol/layer/Image';
import { Options } from 'ol/source/ImageWMS';
import { ServerType } from 'ol/source/wms';
import { ResolvedServerType, ServerType as TMServerType } from '@tailormap-viewer/api';
import { ObjectHelper } from '@tailormap-viewer/shared';

export interface LayerProperties {
  id: string;
  visible: boolean;
  name: string;
  filter?: string;
}

interface WmsServiceParamsModel {
  LAYERS: string;
  VERSION: string;
  QUERY_LAYERS?: string;
  TRANSPARENT: string;
  CQL_FILTER?: string;
}

export class OlLayerHelper {

  public static setLayerProps(layer: LayerModel, olLayer: BaseLayer) {
    const layerProps: LayerProperties = {
      id: layer.id,
      visible: layer.visible,
      name: layer.name,
      filter: LayerTypesHelper.isServiceLayer(layer) ? layer.filter : undefined,
    };
    olLayer.setProperties(layerProps);
  }

  public static getLayerProps(olLayer: BaseLayer): LayerProperties {
    const props = olLayer.getProperties();
    if (!ObjectHelper.hasProperties(props, [ 'id', 'visible', 'name' ])) {
      return { id: '', visible: false, name: 'Invalid layer' };
    }
    return {
      id: props['id'],
      visible: props['visible'],
      name: props['name'],
      filter: props['filter'],
    };
  }

  public static createLayer(layer: LayerModel, projection: Projection, pixelRatio?: number): TileLayer<TileWMS> | ImageLayer<ImageWMS> | TileLayer<XYZ> | TileLayer<WMTS> | null {
    if (LayerTypesHelper.isTmsLayer(layer)) {
      return OlLayerHelper.createTMSLayer(layer, projection);
    }
    if (LayerTypesHelper.isWmsLayer(layer)) {
      return OlLayerHelper.createWMSLayer(layer);
    }
    if (LayerTypesHelper.isWmtsLayer(layer)) {
      return OlLayerHelper.createWMTSLayer(layer, projection, pixelRatio);
    }
    return null;
  }

  /**
   * service is optional but can be passed to set the WMTSLayerModel properties from the WMTS Capabilities
   */
  public static createWMTSLayer(layer: WMTSLayerModel, projection: Projection, pixelRatio?: number): TileLayer<WMTS> | null {
    const parser = new WMTSCapabilities();
    const capabilities = parser.read(layer.capabilities);

    const hiDpi = (pixelRatio || window.devicePixelRatio) > 1 && layer.hiDpiMode && layer.hiDpiMode !== 'disabled';
    const hiDpiLayer = layer.hiDpiSubstituteLayer || layer.layers;

    const options = optionsFromCapabilities(capabilities, {
      layer: hiDpi ? hiDpiLayer : layer.layers,
      matrixSet: projection.getCode(),
    });
    if (options === null) {
      return null;
    }
    options.crossOrigin = layer.crossOrigin;

    if (hiDpi) {
      // For WMTS with hiDpiMode == 'substituteLayerTilePixelRatioOnly' just setting this option suffices. The service should send tiles with
      // 2x the width and height as it advertises in the capabilities.
      options.tilePixelRatio = 2;

      // For WMTS layers with these options, the service sends the tile sizes as advertised (advised to use larger tiles than 256x256), but
      // the tiles are DPI-independent (for instance an aero photo) or are rendered with high DPI (different layer name).
      if (layer.hiDpiMode === 'showNextZoomLevel' || layer.hiDpiMode === 'substituteLayerShowNextZoomLevel') {
        // To use with the OL tilePixelRatio option, we need to halve the tile width and height and double the resolutions to fake the
        // capabilities to make the service look like it sends 2x the tile width/height and pick the tile for a deeper zoom level so we can
        // show sharper details per intrinsic CSS pixel.

        let tileSize = options.tileGrid.getTileSize(0);
        if (Array.isArray(tileSize)) {
          tileSize = (tileSize as number[]).map(value => value / 2);
        } else {
          tileSize = (tileSize as number) / 2;
        }

        const resolutions = options.tileGrid.getResolutions().map(value => value * 2);

        options.tileGrid = new WMTSTileGrid({
          extent: options.tileGrid.getExtent(),
          origin: options.tileGrid.getOrigin(0),
          resolutions,
          matrixIds: options.tileGrid.getMatrixIds(),
          tileSize,
        });
      }
    }

    const source = new WMTS(options);
    return new TileLayer({
      visible: layer.visible,
      source,
    });
  }

  public static createTMSLayer(layer: TMSLayerModel, projection: Projection): TileLayer<XYZ> {
    return new TileLayer({
      visible: layer.visible,
      source: new XYZ({
        ...layer.xyzOptions,
        crossOrigin: layer.crossOrigin,
        projection,
        tilePixelRatio: layer.tilePixelRatio,
      }),
    });
  }

  public static createWMSLayer(layer: WMSLayerModel): TileLayer<TileWMS> | ImageLayer<ImageWMS> {
    let serverType: ServerType | undefined;
    let hidpi = true;

    // If explicitly disabled do not use serverType for hidpi
    if (layer.serverType === TMServerType.DISABLED) {
      serverType = undefined;
      hidpi = false;
    } else {
      // Use the most common geoserver as default for OL hidpi support, it's harmless if the server doesn't support the parameters and returns
      // low dpi images
      serverType = layer.resolvedServerType === ResolvedServerType.GENERIC ? ResolvedServerType.GEOSERVER : layer.resolvedServerType;
    }

    const sourceOptions: Options = {
      url: OgcHelper.filterOgcUrlParameters(layer.url),
      params: OlLayerHelper.getWmsServiceParams(layer),
      crossOrigin: layer.crossOrigin,
      serverType,
      hidpi,
    };

    if (layer.tilingDisabled) {
      const source = new ImageWMS(sourceOptions);
      return new ImageLayer({
        visible: layer.visible,
        source,
      });
    } else {
      const source = new TileWMS({
        ...sourceOptions as any,
        gutter: layer.tilingGutter || 0,
      });
      return new TileLayer({
        visible: layer.visible,
        source,
      });
    }
  }

  public static getWmsServiceParams(layer: WMSLayerModel): WmsServiceParamsModel {
    const params: WmsServiceParamsModel = {
      LAYERS: layer.layers,
      VERSION: '1.1.1',
      QUERY_LAYERS: layer.queryLayers,
      TRANSPARENT: 'TRUE',
    };
    if (layer.filter && layer.resolvedServerType === ResolvedServerType.GEOSERVER) {
      // TODO: implement filtering for other servers than geoserver
      params.CQL_FILTER = layer.filter;
    }
    return params;
  }

}
