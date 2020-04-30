export const omitBy = <T extends {}>(
  object: T,
  filterFn: (property: T[keyof T]) => boolean,
): Partial<T> =>
  Object.entries(object).reduce(
    (acc, [key, value]: [string, T[keyof T]]) =>
      filterFn(value) ? { ...acc, [key]: value } : acc,
    {},
  );

export const omitFalsy = <T extends {}>(object: T) =>
  omitBy(object, (property) => (property ?? false) !== false);
