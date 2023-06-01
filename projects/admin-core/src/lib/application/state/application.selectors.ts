import { ApplicationState, applicationStateKey } from './application.state';
import { createFeatureSelector, createSelector } from '@ngrx/store';
import { ApplicationTreeHelper } from '../helpers/application-tree.helper';
import { selectGeoServiceLayers } from '../../catalog/state/catalog.selectors';
import { LoadingStateEnum } from '@tailormap-viewer/shared';
import { AppTreeNodeModel } from '@tailormap-admin/admin-api';

const selectApplicationState = createFeatureSelector<ApplicationState>(applicationStateKey);

export const selectApplications = createSelector(selectApplicationState, state => state.applications);
export const selectApplicationsLoadStatus = createSelector(selectApplicationState, state => state.applicationsLoadStatus);
export const selectApplicationsLoadError = createSelector(selectApplicationState, state => state.applicationsLoadError);
export const selectApplicationListFilter = createSelector(selectApplicationState, state => state.applicationListFilter);
export const selectDraftApplication = createSelector(selectApplicationState, state => state.draftApplication || null);
export const selectSelectedApplicationId = createSelector(selectApplicationState, state => state.draftApplication?.id || null);
export const selectApplicationServicesLoadStatus = createSelector(selectApplicationState, state => state.applicationServicesLoadStatus);
export const selectDraftApplicationUpdated = createSelector(selectApplicationState, state => state.draftApplicationUpdated);
export const selectExpandedBaseLayerNodes = createSelector(selectApplicationState, state => state.expandedBaseLayerNodes);
export const selectExpandedAppLayerNodes = createSelector(selectApplicationState, state => state.expandedAppLayerNodes);

export const isLoadingApplicationServices = createSelector(
  selectApplicationServicesLoadStatus,
  status => status === LoadingStateEnum.LOADING,
);

export const selectApplicationList = createSelector(
  selectApplications,
  selectApplicationListFilter,
  (applications, filter) => {
    if (!filter) {
      return applications;
    }
    const filterRegexes: RegExp[] = filter.trim().split(' ').map(f => new RegExp(f, 'i'));
    return applications
      .filter(application => {
        const searchableContent = [ application.name, application.title ].join(' ');
        return filterRegexes.every(f => f.test(searchableContent));
      });
  },
);

export const selectApplicationById = (id: string) => createSelector(
  selectApplications,
  (applications) => {
    return applications.find(a => a.id === id) || null;
  },
);

export const selectSelectedApplicationLayerSettings = createSelector(
  selectDraftApplication,
  (application) => {
    return application?.settings?.layerSettings || {};
  },
);

export const selectAppLayerNodesForSelectedApplication = createSelector(
  selectDraftApplication,
  (application): AppTreeNodeModel[] => {
    if (!application?.contentRoot?.layerNodes) {
      return [];
    }
    return application.contentRoot.layerNodes;
  },
);

export const selectBaseLayerNodesForSelectedApplication = createSelector(
  selectDraftApplication,
  (application): AppTreeNodeModel[] => {
    if (!application?.contentRoot?.baseLayerNodes) {
      return [];
    }
    return application.contentRoot.baseLayerNodes;
  },
);

export const selectAppLayerTreeForSelectedApplication = createSelector(
  selectAppLayerNodesForSelectedApplication,
  selectGeoServiceLayers,
  selectExpandedAppLayerNodes,
  (layerNodes, layers, expandedNodes: string[]) => {
    return ApplicationTreeHelper.layerTreeNodeToTree(layerNodes, layers, expandedNodes);
  },
);

export const selectBaseLayerTreeForSelectedApplication = createSelector(
  selectBaseLayerNodesForSelectedApplication,
  selectGeoServiceLayers,
  selectExpandedBaseLayerNodes,
  (baseLayerNodes, layers, expandedNodes: string[]) => {
    return ApplicationTreeHelper.layerTreeNodeToTree(baseLayerNodes, layers, expandedNodes, true);
  },
);

export const selectComponentsConfig = createSelector(selectDraftApplication, application => application?.components);

export const selectComponentsConfigByType = (type: string) => createSelector(
  selectComponentsConfig,
  config => {
    if (!config || !Array.isArray(config)) {
      return undefined;
    }
    return (config || []).find(c => c.type === type);
  },
);

export const selectDisabledComponentsForSelectedApplication = createSelector(
  selectComponentsConfig,
  (config): string[] => {
    if (!config || !Array.isArray(config)) {
      return [];
    }
    return (config || [])
      .filter(c => !c.config.enabled)
      .map(c => c.type);
  });

export const selectStylingConfig = createSelector(selectDraftApplication, application => application?.styling);
