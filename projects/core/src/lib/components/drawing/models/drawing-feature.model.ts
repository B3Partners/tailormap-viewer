import { FeatureModel, FeatureModelAttributes } from '@tailormap-viewer/api';
import { DrawingFeatureTypeEnum } from './drawing-feature-type.enum';

export type MakerType = 'circle' | 'square' | 'triangle' | 'diamond' | 'cross' | 'star' | 'arrow';

export enum ArrowTypeEnum {
  NONE = 'none',
  START = 'start',
  END = 'end',
  BOTH = 'both',
  ALONG = 'along',
}

export enum StrokeTypeEnum {
  SOLID = 'solid',
  DASH = 'dash',
  DOT = 'dot',
}

export interface DrawingFeatureStyleModel {
  marker?: MakerType;
  markerSize?: number;
  markerFillColor?: string;
  markerStrokeColor?: string;
  markerStrokeWidth?: number;
  markerRotation?: number;
  fillOpacity?: number;
  fillColor?: string;
  strokeColor?: string;
  strokeOpacity?: number;
  strokeWidth?: number;
  strokeType?: StrokeTypeEnum;
  arrowType?: ArrowTypeEnum;
  label?: string;
  labelSize?: number;
}

export interface DrawingFeatureModelAttributes extends FeatureModelAttributes {
  type: DrawingFeatureTypeEnum;
  style: DrawingFeatureStyleModel;
  selected?: boolean;
  zIndex?: number;
}

export type DrawingFeatureModel = FeatureModel<DrawingFeatureModelAttributes>;
