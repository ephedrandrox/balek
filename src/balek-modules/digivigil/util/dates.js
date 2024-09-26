define(["dojo/_base/declare"], function (declare) {
  return declare("dateUtility", null, {
    baseClass: "dateUtility",

    //##########################################################################################################
    //Startup Functions Section
    //##########################################################################################################

    constructor: function (args) {
      declare.safeMixin(this, args);
    },
    normalizeDateString: function (dateString) {
      // Normalize time to two digits for hours, minutes, and seconds
      const correctedDateString = dateString.replace(
        /(\d{4}-\d{2}-\d{2}) (\d{1,2}):(\d{1,2}):(\d{1,2})\.(\d{3,4})/,
        (_, datePart, hour, minute, second, milliseconds) => {
          return `${datePart} ${hour.padStart(2, "0")}:${minute.padStart(
            2,
            "0"
          )}:${second.padStart(2, "0")}.${milliseconds.slice(0, 3)}`;
        }
      );

      return correctedDateString;
    },
    getLocalizedDate: function (dateString) {
      const normalizedDateString = this.normalizeDateString(dateString);

      let date = new Date(normalizedDateString);

      // Format the date using `toLocaleDateString`
      let localizedDate = date.toLocaleDateString(undefined, {
        year: "numeric",
        month: "short",
        day: "numeric",
        hour: "numeric",
        minute: "numeric",
      });

      return localizedDate;
    },
  });
});
