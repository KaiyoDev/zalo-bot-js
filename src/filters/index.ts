import type { Update } from "../models/Update";

export type Filter = ((update: Update) => boolean) & {
  and: (other: Filter) => Filter;
  or: (other: Filter) => Filter;
  not: () => Filter;
};

function createFilter(predicate: (update: Update) => boolean): Filter {
  const filter = ((update: Update) => predicate(update)) as Filter;
  filter.and = (other: Filter) => createFilter((update) => filter(update) && other(update));
  filter.or = (other: Filter) => createFilter((update) => filter(update) || other(update));
  filter.not = () => createFilter((update) => !filter(update));
  return filter;
}

export const filters = {
  TEXT: createFilter((update) => Boolean(update.message?.text)),
  COMMAND: createFilter((update) => Boolean(update.message?.text?.startsWith("/"))),
  PHOTO: createFilter((update) => Boolean(update.message?.photoUrl)),
  STICKER: createFilter((update) => Boolean(update.message?.sticker)),
  ALL: createFilter(() => true),
};
