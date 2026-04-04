import type { Application } from "../core/Application";
import type { CallbackContext } from "../core/Context";
import type { Update } from "../models/Update";

export type HandlerCallback = (
  update: Update,
  context: CallbackContext,
) => Promise<void> | void;

export interface Handler {
  checkUpdate(update: Update): boolean;
  handleUpdate(update: Update, application: Application): Promise<void>;
}
