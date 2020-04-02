const numberRegexp = /^-?\d+(,\d+)*(\.\d*(e\d+)?)?%?$|^-?\.\d+%?$/;

export function isNumber(value: any): boolean {
  // TO DO: add regexp for DATE string format (ex match: "28 02 2020")
  // TO DO: add regexp for exp format (ex match: "42E10")
  if (typeof value === "string" && !value.trim().match(numberRegexp)) {
    return false;
  }
  return true;
}

//------------------------------------------------------------------------------
// Miscellaneous
//------------------------------------------------------------------------------

/**
 * Stringify an object, like JSON.stringify, except that the first level of keys
 * is ordered.
 */
export function stringify(obj: any): string {
  return JSON.stringify(obj, Object.keys(obj).sort());
}

/*
 * https://stackoverflow.com/questions/105034/create-guid-uuid-in-javascript
 * */
export function uuidv4(): string {
  if (window.crypto && window.crypto.getRandomValues) {
    //@ts-ignore
    return ([1e7] + -1e3 + -4e3 + -8e3 + -1e11).replace(/[018]/g, c =>
      (c ^ (crypto.getRandomValues(new Uint8Array(1))[0] & (15 >> (c / 4)))).toString(16)
    );
  } else {
    // mainly for jest and other browsers that do not have the crypto functionality
    return "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(/[xy]/g, function(c) {
      var r = (Math.random() * 16) | 0,
        v = c == "x" ? r : (r & 0x3) | 0x8;
      return v.toString(16);
    });
  }
}

/**
 * Sanitize the name of a sheet, by eventually removing quotes
 * @param sheet name of the sheet
 */
export function sanitizeSheet(sheet: string): string {
  if (sheet && sheet.startsWith("'")) {
    sheet = sheet.slice(1, -1).replace(/''/g, "'");
  }
  return sheet;
}