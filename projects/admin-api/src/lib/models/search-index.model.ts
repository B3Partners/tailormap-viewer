import { SearchIndexStatusEnum } from './search-index-status.enum';

export interface SearchIndexModel {
  id: number;
  featureTypeId: number;
  lastIndexed: Date | string | null;
  name: string;
  status: SearchIndexStatusEnum;
  comment: string;
  searchFieldsUsed: string[];
  searchDisplayFieldsUsed: string[];
}
