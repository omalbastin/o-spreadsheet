import { BasePlugin } from "../../base_plugin";
import { CancelledReason, Command, CommandResult, Sheet, UID } from "../../types";

interface UIState {
  activeSheet: Sheet;
}

export class SheetUIPlugin extends BasePlugin<UIState> {
  static getters = ["getActiveSheet", "getActiveSheetId"];
  activeSheet: Sheet = this.getters.getSheets()[0];

  // This flag is used to avoid to historize the ACTIVE_SHEET command when it's
  // the main command.
  private historizeActiveSheet: boolean = true;

  // ---------------------------------------------------------------------------
  // Command Handling
  // ---------------------------------------------------------------------------

  allowDispatch(cmd: Command): CommandResult {
    switch (cmd.type) {
      case "ACTIVATE_SHEET":
        if (!this.getters.getSheet(cmd.sheetIdTo)) {
          return {
            status: "CANCELLED",
            reason: CancelledReason.InvalidSheetId,
          };
        }
        this.historizeActiveSheet = false;
        break;
    }
    return { status: "SUCCESS" };
  }

  handle(cmd: Command) {
    switch (cmd.type) {
      case "ACTIVATE_SHEET":
        const sheet = this.getters.getSheet(cmd.sheetIdTo)!;
        if (this.historizeActiveSheet) {
          this.history.update("activeSheet", sheet);
        } else {
          this.activeSheet = sheet;
        }
        break;
    }
  }

  finalize() {
    this.historizeActiveSheet = true;
  }

  // ---------------------------------------------------------------------------
  // Getters
  // ---------------------------------------------------------------------------

  getActiveSheet(): Sheet {
    return this.activeSheet;
  }

  getActiveSheetId(): UID {
    return this.activeSheet.id;
  }
}