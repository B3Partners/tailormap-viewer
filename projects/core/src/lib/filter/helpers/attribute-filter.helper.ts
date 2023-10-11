import { FilterConditionEnum } from '../models/filter-condition.enum';
import { AttributeType } from '@tailormap-viewer/api';
import { FilterConditionModel } from '../models/filter-condition.model';
import { AttributeFilterModel } from '../models/attribute-filter.model';

export class AttributeFilterHelper {

  private static filtersRequiringAtLeastOneValue = new Set([
    FilterConditionEnum.NUMBER_EQUALS_KEY,
    FilterConditionEnum.NUMBER_LARGER_THAN_KEY,
    FilterConditionEnum.NUMBER_SMALLER_THAN_KEY,
    FilterConditionEnum.NUMBER_LARGER_EQUALS_THAN_KEY,
    FilterConditionEnum.NUMBER_SMALLER_EQUALS_THAN_KEY,
    FilterConditionEnum.STRING_EQUALS_KEY,
    FilterConditionEnum.STRING_LIKE_KEY,
    FilterConditionEnum.STRING_STARTS_WITH_KEY,
    FilterConditionEnum.STRING_ENDS_WITH_KEY,
    FilterConditionEnum.DATE_ON_KEY,
    FilterConditionEnum.DATE_AFTER_KEY,
    FilterConditionEnum.DATE_BEFORE_KEY,
    FilterConditionEnum.UNIQUE_VALUES_KEY,
  ]);

  private static filtersRequiringTwoValues = new Set([
    FilterConditionEnum.NUMBER_BETWEEN_KEY,
    FilterConditionEnum.DATE_BETWEEN_KEY,
  ]);

  public static getConditionTypes(includeUniqueValues = false): FilterConditionModel[] {
    const types: FilterConditionModel[] = [
      {
        condition: FilterConditionEnum.NUMBER_EQUALS_KEY,
        label: $localize `:@@core.filter.equals:Equals`,
        readableLabel: $localize `:@@core.filter.equals-to:equals to`,
        attributeType: [ AttributeType.INTEGER, AttributeType.DOUBLE ],
      },
      {
        condition: FilterConditionEnum.NUMBER_LARGER_THAN_KEY,
        label: $localize `:@@core.filter.greater-than:Greater than`,
        readableLabel: $localize `:@@core.filter.is-greater-than:is greater than`,
        attributeType: [ AttributeType.INTEGER, AttributeType.DOUBLE ],
      },
      {
        condition: FilterConditionEnum.NUMBER_SMALLER_THAN_KEY,
        label: $localize `:@@core.filter.smaller-than:Smaller than`,
        readableLabel: $localize `:@@core.filter.is-smaller-than:is smaller than`,
        attributeType: [ AttributeType.INTEGER, AttributeType.DOUBLE ],
      },
      {
        condition: FilterConditionEnum.NUMBER_LARGER_EQUALS_THAN_KEY,
        label: $localize `:@@core.filter.greater-than-or-equal-to:Greater than or equal to`,
        readableLabel: $localize `:@@core.filter.is-greater-than-or-equal-to:is greater than or equal to`,
        attributeType: [ AttributeType.INTEGER, AttributeType.DOUBLE ],
      },
      {
        condition: FilterConditionEnum.NUMBER_SMALLER_EQUALS_THAN_KEY,
        label: $localize `:@@core.filter.smaller-than-or-equal-to:Smaller than or equal to`,
        readableLabel: $localize `:@@core.filter.is-smaller-than-or-equal-to:is smaller than or equal to`,
        attributeType: [ AttributeType.INTEGER, AttributeType.DOUBLE ],
      },
      {
        condition: FilterConditionEnum.NUMBER_BETWEEN_KEY,
        label: $localize `:@@core.filter.between:Between`,
        readableLabel: $localize `:@@core.filter.is-between:is between`,
        attributeType: [ AttributeType.INTEGER, AttributeType.DOUBLE ],
      },
      {
        condition: FilterConditionEnum.STRING_EQUALS_KEY,
        label: $localize `:@@core.filter.equals:Equals`,
        readableLabel: $localize `:@@core.filter.equals-to:equals to`,
        attributeType: [AttributeType.STRING],
      },
      {
        condition: FilterConditionEnum.STRING_LIKE_KEY,
        label: $localize `:@@core.filter.contains:Contains`,
        readableLabel: $localize `:@@core.filter.contains:contains`,
        attributeType: [AttributeType.STRING],
      },
      {
        condition: FilterConditionEnum.STRING_STARTS_WITH_KEY,
        label: $localize `:@@core.filter.starts-with:Starts with`,
        readableLabel: $localize `:@@core.filter.starts-with:starts with`,
        attributeType: [AttributeType.STRING],
      },
      {
        condition: FilterConditionEnum.STRING_ENDS_WITH_KEY,
        label: $localize `:@@core.filter.ends-with:Ends with`,
        readableLabel: $localize `:@@core.filter.ends-with:ends with`,
        attributeType: [AttributeType.STRING],
      },
      {
        condition: FilterConditionEnum.DATE_ON_KEY,
        label: $localize `:@@core.filter.on:On`,
        readableLabel: $localize `:@@core.filter.is-on:is on`,
        attributeType: [ AttributeType.DATE, AttributeType.TIMESTAMP ],
      },
      {
        condition: FilterConditionEnum.DATE_AFTER_KEY,
        label: $localize `:@@core.filter.after:After`,
        readableLabel: $localize `:@@core.filter.is-after:is after`,
        attributeType: [ AttributeType.DATE, AttributeType.TIMESTAMP ],
      },
      {
        condition: FilterConditionEnum.DATE_BEFORE_KEY,
        label: $localize `:@@core.filter.before:Before`,
        readableLabel: $localize `:@@core.filter.is-before:is before`,
        attributeType: [ AttributeType.DATE, AttributeType.TIMESTAMP ],
      },
      {
        condition: FilterConditionEnum.DATE_BETWEEN_KEY,
        label: $localize `:@@core.filter.between:Between`,
        readableLabel: $localize `:@@core.filter.is-between:is between`,
        attributeType: [ AttributeType.DATE, AttributeType.TIMESTAMP ],
      },
      {
        condition: FilterConditionEnum.BOOLEAN_TRUE_KEY,
        label: $localize `:@@core.filter.is-true:Is true`,
        readableLabel: $localize `:@@core.filter.is-true:is true`,
        attributeType: [AttributeType.BOOLEAN],
      },
      {
        condition: FilterConditionEnum.BOOLEAN_FALSE_KEY,
        label: $localize `:@@core.filter.is-false:Is false`,
        readableLabel: $localize `:@@core.filter.is-false:is false`,
        attributeType: [AttributeType.BOOLEAN],
      },
      {
        condition: FilterConditionEnum.NULL_KEY,
        label: $localize `:@@core.filter.is-null:Is null`,
        readableLabel: $localize `:@@core.filter.is-null:is null`,
        attributeType: [],
      },
    ];
    if (includeUniqueValues) {
      types.push({
        condition: FilterConditionEnum.UNIQUE_VALUES_KEY,
        label: $localize `:@@core.filter.choose-values:Choose values`,
        readableLabel: $localize `:@@core.filter.contains-one-of-the-values:contains one of the values`,
        attributeType: [],
      });
    }
    return types;
  }

  public static isValidFilter(filter: Partial<AttributeFilterModel> | null): filter is AttributeFilterModel {
    if (!filter || !filter.condition || !filter.attribute || !filter.attributeType) {
      return false;
    }
    if (AttributeFilterHelper.filtersRequiringTwoValues.has(filter.condition)) {
      return AttributeFilterHelper.isValidValues(filter.value, 2);
    }
    if (AttributeFilterHelper.filtersRequiringAtLeastOneValue.has(filter.condition)) {
      return AttributeFilterHelper.isValidValues(filter.value, 1);
    }
    return true;
  }

  private static isValidValues(values: string[] | undefined, minLength: number) {
    if (!values || values.length < minLength) {
      return false;
    }
    return values.every(v => {
      return typeof v !== 'undefined' && v !== null && v !== '';
    });
  }

}
