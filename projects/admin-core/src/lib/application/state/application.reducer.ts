import * as ApplicationActions from './application.actions';
import { Action, createReducer, on } from '@ngrx/store';
import { ApplicationState, initialApplicationState } from './application.state';
import { LoadingStateEnum } from '@tailormap-viewer/shared';
import { AppContentModel, ApplicationModel, AppTreeNodeModel } from '@tailormap-admin/admin-api';
import { ApplicationModelHelper } from '../helpers/application-model.helper';
import { ComponentModel } from '@tailormap-viewer/api';
import { clearSelectedApplication } from './application.actions';

const getApplication = (application: ApplicationModel) => ({
  ...application,
  id: `${application.id}`,
});

const updateApplication = (
  state: ApplicationState,
  applicationId: string,
  updateMethod: (application: ApplicationModel) => Partial<ApplicationModel>,
) => {
  if (!state.draftApplication || applicationId !== state.draftApplication.id) {
    return state;
  }
  return {
    ...state,
    draftApplication: {
      ...state.draftApplication,
      ...updateMethod(state.draftApplication),
    },
  };
};

const updateApplicationTree = (
  state: ApplicationState,
  applicationId: string,
  treeKey: 'layer' | 'baseLayer',
  updateMethod: (application: ApplicationModel, tree: AppTreeNodeModel[]) => AppTreeNodeModel[],
) => {
  if (!state.draftApplication || applicationId !== state.draftApplication.id) {
    return state;
  }
  const tree: 'baseLayerNodes' | 'layerNodes' = treeKey === 'baseLayer' ? 'baseLayerNodes' : 'layerNodes';
  const contentRoot = ApplicationModelHelper.getApplicationContentRoot(state.draftApplication);
  const updatedContentRoot: AppContentModel = {
    ...contentRoot,
    [tree]: updateMethod(state.draftApplication, contentRoot[tree]),
  };
  return {
    ...state,
    draftApplication: {
      ...state.draftApplication,
      contentRoot: updatedContentRoot,
    },
  };
};

const onLoadApplicationStart = (state: ApplicationState): ApplicationState => ({
  ...state,
  applicationsLoadStatus: LoadingStateEnum.LOADING,
  applicationsLoadError: undefined,
  applications: [],
});

const onLoadApplicationsSuccess = (
  state: ApplicationState,
  payload: ReturnType<typeof ApplicationActions.loadApplicationsSuccess>,
): ApplicationState => ({
  ...state,
  applicationsLoadStatus: LoadingStateEnum.LOADED,
  applicationsLoadError: undefined,
  applications: payload.applications.map(getApplication),
});

const onLoadApplicationsFailed = (
  state: ApplicationState,
  payload: ReturnType<typeof ApplicationActions.loadApplicationsFailed>,
): ApplicationState => ({
  ...state,
  applicationsLoadStatus: LoadingStateEnum.FAILED,
  applicationsLoadError: payload.error,
  applications: [],
});

const onSetApplicationListFilter = (
  state: ApplicationState,
  payload: ReturnType<typeof ApplicationActions.setApplicationListFilter>,
): ApplicationState => ({
  ...state,
  applicationListFilter: payload.filter,
});

const onSetSelectedApplication = (
  state: ApplicationState,
  payload: ReturnType<typeof ApplicationActions.setSelectedApplication>,
): ApplicationState => {
  const draftApplication = payload.applicationId !== null
    ? state.applications.find(a => a.id === payload.applicationId)
    : null;
  return {
    ...state,
    draftApplication: draftApplication ? { ...draftApplication } : null,
  };
};

const onClearSelectedApplication = (state: ApplicationState): ApplicationState => ({
  ...state,
  draftApplication: null,
});

const onAddApplications = (
  state: ApplicationState,
  payload: ReturnType<typeof ApplicationActions.addApplications>,
): ApplicationState => ({
  ...state,
  applications: [
    ...state.applications,
    ...payload.applications.map(getApplication),
  ],
});

const onUpdateApplication = (
  state: ApplicationState,
  payload: ReturnType<typeof ApplicationActions.updateApplication>,
): ApplicationState => {
  const updatedApplication = getApplication(payload.application);
  const idx = state.applications.findIndex(application => application.id === updatedApplication.id);
  if (idx === -1) {
    return state;
  }
  return {
    ...state,
    applications: [
      ...state.applications.slice(0, idx),
      updatedApplication,
      ...state.applications.slice(idx + 1),
    ],
  };
};

const onDeleteApplication = (
  state: ApplicationState,
  payload: ReturnType<typeof ApplicationActions.deleteApplication>,
): ApplicationState => ({
  ...state,
  applications: state.applications.filter(application => application.id !== payload.applicationId),
});

const onAddApplicationTreeNodes = (
  state: ApplicationState,
  payload: ReturnType<typeof ApplicationActions.addApplicationTreeNodes>,
): ApplicationState => {
  return updateApplicationTree(state, payload.applicationId, payload.tree, (application, tree) => {
    return ApplicationModelHelper.addNodesToApplicationTree(application, tree, payload);
  });
};

const onUpdateApplicationTreeNode = (
  state: ApplicationState,
  payload: ReturnType<typeof ApplicationActions.updateApplicationTreeNode>,
): ApplicationState => {
  return updateApplicationTree(state, payload.applicationId, payload.tree, (application, tree) => {
    const idx = tree.findIndex(node => node.id === payload.nodeId);
    if (idx === -1) {
      return tree;
    }
    return [
      ...tree.slice(0, idx),
      {
        ...tree[idx],
        ...payload.updatedNode,
      },
      ...tree.slice(idx + 1),
    ];
  });
};

const onRemoveApplicationTreeNode = (
  state: ApplicationState,
  payload: ReturnType<typeof ApplicationActions.removeApplicationTreeNode>,
): ApplicationState => {
  return updateApplicationTree(state, payload.applicationId, payload.tree, (application, tree) => {
    const idx = tree.findIndex(node => node.id === payload.nodeId);
    if (idx === -1) {
      return tree;
    }
    return [
      ...tree.slice(0, idx),
      ...tree.slice(idx + 1),
    ];
  });
};

export const onUpdateApplicationTreeOrder = (
  state: ApplicationState,
  payload: ReturnType<typeof ApplicationActions.updateApplicationTreeOrder>,
): ApplicationState => {
  return updateApplicationTree(state, payload.applicationId, payload.tree, (application, tree) => {
    return ApplicationModelHelper.updateApplicationOrder(application, tree, payload);
  });
};

export const onUpdateApplicationTreeNodeVisibility = (
  state: ApplicationState,
  payload: ReturnType<typeof ApplicationActions.updateApplicationTreeNodeVisibility>,
): ApplicationState => {
  const visibilityChanged = new Map<string, boolean>(payload.visibility.map(v => [ v.nodeId, v.visible ]));
  return updateApplicationTree(state, payload.applicationId, payload.tree, (_, tree) => {
    return tree.map(node => {
      if (ApplicationModelHelper.isLayerTreeNode(node) && visibilityChanged.has(node.id)) {
        return { ...node, visible: !!visibilityChanged.get(node.id) };
      }
      return node;
    });
  });
};

const onUpdateApplicationNodeSettings = (
  state: ApplicationState,
  payload: ReturnType<typeof ApplicationActions.updateApplicationNodeSettings>,
): ApplicationState => {
  return updateApplication(state, payload.applicationId, application => {
    const updatedSettings = {
      ...application.settings?.layerSettings || {},
      [payload.nodeId]: {
        ...application.settings?.layerSettings?.[payload.nodeId] || {},
        ...payload.settings || {},
      },
    };
    if (!payload.settings) {
      delete updatedSettings[payload.nodeId];
    }
    return {
      settings: {
        ...application.settings,
        layerSettings: updatedSettings,
      },
    };
  });
};

const onLoadApplicationServices = (state: ApplicationState): ApplicationState => ({
  ...state,
  applicationServicesLoadStatus: LoadingStateEnum.LOADING,
});

const onLoadApplicationServicesSuccess = (state: ApplicationState): ApplicationState => ({
  ...state,
  applicationServicesLoadStatus: LoadingStateEnum.LOADED,
});

const onUpdateApplicationComponentConfig = (state: ApplicationState, payload: ReturnType<typeof ApplicationActions.updateApplicationComponentConfig>): ApplicationState => {
  return updateApplication(state, payload.applicationId, application => {
    const components = application.components || [];
    const componentIdx = components.findIndex(component => component.type === payload.componentType);
    const updatedComponents: ComponentModel[] = [
      ...components.slice(0, componentIdx),
      {
        type: payload.componentType,
        config: payload.config,
      },
      ...components.slice(componentIdx + 1),
    ];
    return { components: updatedComponents };
  });
};

const onUpdateApplicationStylingConfig = (state: ApplicationState, payload: ReturnType<typeof ApplicationActions.updateApplicationStylingConfig>): ApplicationState => {
  return updateApplication(state, payload.applicationId, application => {
    return {
      styling: {
        ...application.styling,
        ...payload.styling,
      },
    };
  });
};

const applicationReducerImpl = createReducer<ApplicationState>(
  initialApplicationState,
  on(ApplicationActions.loadApplicationsStart, onLoadApplicationStart),
  on(ApplicationActions.loadApplicationsSuccess, onLoadApplicationsSuccess),
  on(ApplicationActions.loadApplicationsFailed, onLoadApplicationsFailed),
  on(ApplicationActions.setApplicationListFilter, onSetApplicationListFilter),
  on(ApplicationActions.setSelectedApplication, onSetSelectedApplication),
  on(ApplicationActions.clearSelectedApplication, onClearSelectedApplication),
  on(ApplicationActions.addApplications, onAddApplications),
  on(ApplicationActions.updateApplication, onUpdateApplication),
  on(ApplicationActions.deleteApplication, onDeleteApplication),
  on(ApplicationActions.addApplicationTreeNodes, onAddApplicationTreeNodes),
  on(ApplicationActions.updateApplicationTreeNode, onUpdateApplicationTreeNode),
  on(ApplicationActions.removeApplicationTreeNode, onRemoveApplicationTreeNode),
  on(ApplicationActions.updateApplicationTreeOrder, onUpdateApplicationTreeOrder),
  on(ApplicationActions.updateApplicationTreeNodeVisibility, onUpdateApplicationTreeNodeVisibility),
  on(ApplicationActions.updateApplicationNodeSettings, onUpdateApplicationNodeSettings),
  on(ApplicationActions.loadApplicationServices, onLoadApplicationServices),
  on(ApplicationActions.loadApplicationServicesSuccess, onLoadApplicationServicesSuccess),
  on(ApplicationActions.updateApplicationComponentConfig, onUpdateApplicationComponentConfig),
  on(ApplicationActions.updateApplicationStylingConfig, onUpdateApplicationStylingConfig),
);
export const applicationReducer = (state: ApplicationState | undefined, action: Action) => applicationReducerImpl(state, action);
