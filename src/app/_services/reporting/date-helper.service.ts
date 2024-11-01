// Import the core angular services.
import { formatDate as ngFormatDate } from "@angular/common";
import { Inject } from "@angular/core";
import { Injectable } from "@angular/core";
import { LOCALE_ID } from "@angular/core";
import { DateRangeValidator, DayTimeRangeValidator, ScheduleDateValidator, ScheduleValidator } from "src/app/_interfaces";
// import * as moment from 'moment';
// ----------------------------------------------------------------------------------- //
// ----------------------------------------------------------------------------------- //

// CAUTION: Numbers are implicitly assumed to be milliseconds since epoch and strings are
// implicitly assumed to be valid for the Date() constructor.
export type DateInput = Date | number | string;

// The single-character values here are meant to match the mask placeholders used in the
// native formatDate() function.
export type DatePart =
	| "y" | "year"
	| "M" | "month"
	| "d" | "day"
	| "h" | "hour"
	| "m" | "minute"
	| "s" | "second"
	| "S" | "millisecond"
;

var MS_SECOND = 1000;
var MS_MINUTE = ( MS_SECOND * 60 );
var MS_HOUR = ( MS_MINUTE * 60 );
var MS_DAY = ( MS_HOUR * 24 );
var MS_MONTH = ( MS_DAY * 30 ); // Rough estimate.
var MS_YEAR = ( MS_DAY * 365 ); // Rough estimate.

// The Moment.js library documents the "buckets" into which the "FROM NOW" deltas fall.
// To mimic this logic using milliseconds since epoch, let's calculate rough estimates of
// all the offsets. Then, we simply need to find the lowest matching bucket.
// --
// https://momentjs.com/docs/#/displaying/fromnow/
// 0 to 44 seconds --> a few seconds ago
// 45 to 89 seconds --> a minute ago
// 90 seconds to 44 minutes --> 2 minutes ago ... 44 minutes ago
// 45 to 89 minutes --> an hour ago
// 90 minutes to 21 hours --> 2 hours ago ... 21 hours ago
// 22 to 35 hours --> a day ago
// 36 hours to 25 days --> 2 days ago ... 25 days ago
// 26 to 45 days --> a month ago
// 45 to 319 days --> 2 months ago ... 10 months ago
// 320 to 547 days (1.5 years) --> a year ago
// 548 days+ --> 2 years ago ... 20 years ago
// --
// Here are the bucket delimiters in milliseconds:
var FROM_NOW_JUST_NOW = ( MS_SECOND * 44 );
var FROM_NOW_MINUTE = ( MS_SECOND * 89 );
var FROM_NOW_MINUTES = ( MS_MINUTE * 44 );
var FROM_NOW_HOUR = ( MS_MINUTE * 89 );
var FROM_NOW_HOURS = ( MS_HOUR * 21 );
var FROM_NOW_DAY = ( MS_HOUR * 35 );
var FROM_NOW_DAYS = ( MS_DAY * 25 );
var FROM_NOW_MONTH = ( MS_DAY * 45 );
var FROM_NOW_MONTHS = ( MS_DAY * 319 );
var FROM_NOW_YEAR = ( MS_DAY * 547 );

@Injectable({
	providedIn: "root"
})
export class DateHelperService {

	private localID: string;
  timeSlots: string[] = []; // Store generated time slots
  private disallowedDates: { startDate: string; endDate: string }[] = [];
  private disallowedWeekdays: Set<number> = new Set(); // Store disallowed weekdays as numbers

  private disallowedDateObjects: { startDate: Date; endDate: Date }[] = [];
	// I initialize the date-helper with the given localization token.
	constructor( @Inject( LOCALE_ID ) localID: string ) {
    // console.log('localID', localID)
		this.localID = localID;

	}

  // Updated method to set disallowed dates and weekdays
// Updated method to set disallowed dates and weekdays
  setDisallowedDates(
    dateValidator: ScheduleDateValidator,
    weekDayTimeValidator: ScheduleValidator
  ) {
    // Safely store the allowedDates, handling null or undefined values
    this.disallowedDates = dateValidator?.allowedDates || [];

    // Safely extract disabled weekdays, handling null or undefined week property
    this.disallowedWeekdays = new Set(
      (weekDayTimeValidator?.week || [])
        .filter((day) => day?.disabled) // Only process disabled days
        .map((day) => this.getDayNumber(day.day))
    );
  }

  // setDisallowedDates(
  //   dateValidator: ScheduleDateValidator,
  //   weekDayTimeValidator: ScheduleValidator
  // ) {
  //   // Store the allowedDates from ScheduleDateValidator as disallowed dates
  //   this.disallowedDates = dateValidator.allowedDates;

  //   // Extract disabled weekdays from ScheduleValidator
  //   this.disallowedWeekdays = new Set(
  //     weekDayTimeValidator.week
  //       .filter((day) => day.disabled) // Only process disabled days
  //       .map((day) => this.getDayNumber(day.day))
  //   );


  // };


  // Convert day name to JavaScript's numeric day (0 = Sunday, 6 = Saturday)
  private getDayNumber(day: string): number {
    const daysOfWeek = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
    return daysOfWeek.indexOf(day);
  }

  // Helper to convert string date to Date object with timezone adjustment
  private toDate(dateString: string): Date {
    const date = new Date(dateString);
    if (isNaN(date.getTime())) {
      throw new Error(`Invalid date string: ${dateString}`);
    }
    return new Date(date.getTime() + date.getTimezoneOffset() * 60000);
  }

  // Generate the filter function for ngx-mat-datetime-picker
  generateDisallowedDateFilter(minDate?: Date): (dateTime: Date | null) => boolean {

    if (!minDate) {minDate = new Date()}
    return (dateTime: Date | null): boolean => {
      if (!dateTime) return false;

      // Enforce minDate constraint
      if (dateTime < minDate) return false;

      // Block disallowed weekdays
      if (this.disallowedWeekdays.has(dateTime.getDay())) return false;

      // Block specific disallowed date ranges
      return !this.disallowedDates.some((range) => {
        const startDate = this.toDate(range.startDate);
        const endDate = this.toDate(range.endDate);
        return dateTime >= startDate && dateTime <= endDate;
      });
    };
  }

   // Generate time slots based on provided time ranges or default to 6 AM - 9 PM
   generateTimeSlots(timeRanges?: { startTime: string; endTime: string }[]): void {
    if (!timeRanges || timeRanges.length === 0) {
      // Default: Generate from 6 AM to 9 PM in 15-minute intervals
      this.generateDefaultTimeSlots();
    } else {
      // Generate time slots based on provided ranges
      timeRanges.forEach((range) => {
        this.generateTimeSlotsForRange(range.startTime, range.endTime);
      });
    }
  }

  // Generate 15-minute intervals between 6 AM and 9 PM
  private generateDefaultTimeSlots() {
    this.generateTimeSlotsForRange('06:00', '21:00');
  }

  private generateTimeSlotsForRange(startTime: string, endTime: string) {
    const [startHours, startMinutes] = startTime.split(':').map(Number);
    const [endHours, endMinutes] = endTime.split(':').map(Number);

    const start = new Date();
    start.setHours(startHours, startMinutes, 0, 0);

    const end = new Date();
    end.setHours(endHours, endMinutes, 0, 0);

    this.timeSlots = []; // Store generated time slots

    while (start <= end) {
      const hours = start.getHours();
      const minutes = start.getMinutes().toString().padStart(2, '0');

      // Convert hours from 24-hour format to 12-hour format
      const ampm = hours >= 12 ? 'PM' : 'AM';
      const formattedHours = hours % 12 || 12; // Convert '0' to '12' for midnight

      // Create the time slot string in 'HH:mm AM/PM' format
      const timeSlot = `${formattedHours}:${minutes} ${ampm}`;
      this.timeSlots.push(timeSlot);

      // Increment by 15 minutes
      start.setMinutes(start.getMinutes() + 15);
    }

    return this.timeSlots;
  }


  // Generate 15-minute intervals for a specific time range
  private generateTimeSlotsForRange24Hr(startTime: string, endTime: string) {
    const [startHours, startMinutes] = startTime.split(':').map(Number);
    const [endHours, endMinutes] = endTime.split(':').map(Number);

    const start = new Date();
    start.setHours(startHours, startMinutes, 0, 0);

    const end = new Date();
    end.setHours(endHours, endMinutes, 0, 0);
    this.timeSlots = []; // Store generated time slots

    while (start <= end) {
      const hours = start.getHours().toString().padStart(2, '0');
      const minutes = start.getMinutes().toString().padStart(2, '0');
      this.timeSlots.push(`${hours}:${minutes}`);
      start.setMinutes(start.getMinutes() + 15); // Increment by 15 minutes
    }
    return this.timeSlots
  }

    // // Convert string to Date with timezone adjustment
    // private toDate(dateString: string): Date {
    //   const date = new Date(dateString);
    //   if (isNaN(date.getTime())) {
    //     throw new Error(`Invalid date string: ${dateString}`);
    //   }
    //   return new Date(date.getTime() + date.getTimezoneOffset() * 60000);
    // }
    // // Generate the filter function, now also accepting a minDate
    // generateDisallowedDateFilter(minDate?: Date): (dateTime: Date | null) => boolean {
    //   if (!minDate) { minDate = new Date()}

    //   return (dateTime: Date | null): boolean => {
    //     if (!dateTime) return false;

    //     // Enforce minDate constraint
    //     if (dateTime < minDate) return false;

    //     // Check if the date falls within any disallowed range
    //     return !this.disallowedDates.some((range) => {
    //       const startDate = this.toDate(range.startDate);
    //       const endDate = this.toDate(range.endDate);
    //       return dateTime >= startDate && dateTime <= endDate;
    //     });
    //   };
    // }



  isDateTimeDisallowed(dateTime: Date): boolean {
    return this.disallowedDateObjects.some((range) => {
      return dateTime >= range.startDate && dateTime <= range.endDate;
    });
  }

  // Retrieve disallowed dates
  getDisallowedDates(): DateRangeValidator[] {
    return this.disallowedDates;
  }


  getDates(startDate: Date, endDate: Date): Date[] {
    let dates = [];
    let currentDate = new Date(startDate);

    while (currentDate <= endDate) {
      dates.push(new Date(currentDate));
      currentDate.setDate(currentDate.getDate() + 1);
    }

    return dates;
  }
	// ---
	// PUBLIC METHODS.
	// ---

	// I add the given date/time delta to the given date. A new date is returned.
	public add( part: DatePart, delta: number, input: DateInput ) : Date {

		var result = new Date( input );

		switch ( part ) {
			case "year":
			case "y":
				result.setFullYear( result.getFullYear() + delta );
			break;
			case "month":
			case "M":
				result.setMonth( result.getMonth() + delta );
			break;
			case "day":
			case "d":
				result.setDate( result.getDate() + delta );
			break;
			case "hour":
			case "h":
				result.setHours( result.getHours() + delta );
			break;
			case "minute":
			case "m":
				result.setMinutes( result.getMinutes() + delta );
			break;
			case "second":
			case "s":
				result.setSeconds( result.getSeconds() + delta );
			break;
			case "millisecond":
			case "S":
				result.setMilliseconds( result.getMilliseconds() + delta );
			break;
		}

		return( result );

	}

  adjustTimeZone(date: Date): Date {

    // return new Date(date.getTime() );
    if (!date) { return null}
    const localTimeOffset = date.getTimezoneOffset() * 60000;

    const returnDate =  new Date(date.getTime() - localTimeOffset);

    // console.log('Initial Date', date)
    // console.log('Return  Date' , returnDate)
    // console.log('Return isoString' , returnDate.toISOString())

    return returnDate
  }


	// I return the number of days in the given month. The year must be included since
	// the days in February change during a leap-year.
	public daysInMonth( year: number, month: number ) : number {

		var lastDayOfMonth = new Date(
			year,
			// Go to the "next" month. This is always safe to do; if the next month is
			// beyond the boundary of the current year, it will automatically become the
			// appropriate month of the following year.
			( month + 1 ),
			// Go to the "zero" day of the "next" month. Since days range from 1-31, the
			// "0" day will automatically roll back to the last day of the previous
			// month. And, since we did ( month + 1 ) above, it will be ( month + 1 - 1 )
			// ... or simply, the last day of the "month" in question.
			0
		);

		return( lastDayOfMonth.getDate() );

	}


	// I determine the mount by which the first date is less than the second date using
	// the given date part. Returns an INTEGER that rounds down.
	// --
	// CAUTION: The Year / Month / Day diff'ing is a ROUGH ESTIMATE that should be good
	// enough for the vast majority of User Interface (UI) cases, especially since we're
	// rounding the differences in general. If you need something more accurate, that
	// would be the perfect reason to pull-in an external date library.
	public diff( part: DatePart, leftDateInput: DateInput, rightDateInput: DateInput ) : number {

		var delta = ( this.getTickCount( rightDateInput ) - this.getTickCount( leftDateInput ) );
		var multiplier = 1;

		// We always want the delta to be a positive number so that the .floor()
		// operation in the following switch truncates the value in a consistent way. We
		// will compensate for the normalization by using a dynamic multiplier.
		if ( delta < 0 ) {

			delta = Math.abs( delta );
			multiplier = -1;

		}

		switch ( part ) {
			case "year":
			case "y":
				// CAUTION: Rough estimate.
				return( Math.floor( delta / MS_YEAR ) * multiplier );
			break;
			case "month":
			case "M":
				// CAUTION: Rough estimate.
				return( Math.floor( delta / MS_MONTH ) * multiplier );
			break;
			case "day":
			case "d":
				// CAUTION: Rough estimate.
				return( Math.floor( delta / MS_DAY ) * multiplier );
			break;
			case "hour":
			case "h":
				return( Math.floor( delta / MS_HOUR ) * multiplier );
			break;
			case "minute":
			case "m":
				return( Math.floor( delta / MS_MINUTE ) * multiplier );
			break;
			case "second":
			case "s":
				return( Math.floor( delta / MS_SECOND ) * multiplier );
			break;
			case "millisecond":
			case "S":
				return( delta * multiplier );
			break;
		}

	}


	// I proxy the native formatDate() function with a partial application of the
	// LOCALE_ID that is being used in the application.
	public format( value: DateInput, mask: string ) : string {
    if (!value) {return ""}
    // console.log('localID', this.localID )
		return( ngFormatDate( value, mask, this.localID ) );

	}


   getFormattedDate(): string {
    const date = new Date();
    const month = String(date.getMonth() + 1).padStart(2, '0'); // months are 0-based
    const day = String(date.getDate()).padStart(2, '0');
    const year = date.getFullYear();

    return `${month}/${day}/${year}`;
 }


 getFormattedByDate(dateString): string {
  const date = new Date(dateString);
  const month = String(date.getMonth() + 1).padStart(2, '0'); // months are 0-based
  const day = String(date.getDate()).padStart(2, '0');
  const year = date.getFullYear();

  return `${month}/${day}/${year}`;
}

	// I return a human-friendly, relative date-string for the given input. This is
	// intended to mimic the .fromNow() method in Moment.js:
	public fromNow( value: DateInput ) : string {

		var nowTick = this.getTickCount();
		var valueTick = this.getTickCount( value );
		var delta = ( nowTick - valueTick );
		var prefix = "";
		var infix = "";
		var suffix = " ago"; // Assume past-dates by default.

		// If we're dealing with a future date, we need to flip the delta so that our
		// buckets can be used in a consistent manner. We will compensate for this change
		// by using a different prefix/suffix.
		if ( delta < 0 ) {

			delta = Math.abs( delta );
			prefix = "in ";
			suffix = "";

		}

		// NOTE: We are using Math.ceil() in the following calculations so that we never
		// round-down to a "singular" number that may clash with a plural identifier (ex,
		// "days"). All singular numbers are handled by explicit delta-buckets.
		if ( delta <= FROM_NOW_JUST_NOW ) {

			infix = "a few seconds";

		} else if ( delta <= FROM_NOW_MINUTE ) {

			infix = "a minute";

		} else if ( delta <= FROM_NOW_MINUTES ) {

			infix = ( Math.ceil( delta / MS_MINUTE ) + " minutes" );

		} else if ( delta <= FROM_NOW_HOUR ) {

			infix = "an hour";

		} else if ( delta <= FROM_NOW_HOURS ) {

			infix = ( Math.ceil( delta / MS_HOUR ) + " hours" );

		} else if ( delta <= FROM_NOW_DAY ) {

			infix = "a day";

		} else if ( delta <= FROM_NOW_DAYS ) {

			infix = ( Math.ceil( delta / MS_DAY ) + " days" );

		} else if ( delta <= FROM_NOW_MONTH ) {

			infix = "a month";

		} else if ( delta <= FROM_NOW_MONTHS ) {

			infix = ( Math.ceil( delta / MS_MONTH ) + " months" );

		} else if ( delta <= FROM_NOW_YEAR ) {

			infix = "a year";

		} else {

			infix = ( Math.ceil( delta / MS_YEAR ) + " years" );

		}

		return( prefix + infix + suffix );

	}

	// ---
	// PRIVATE METHODS.
	// ---

	// I return the milliseconds since epoch for the given value.
	private getTickCount( value: DateInput = Date.now() ) : number {

		// If the passed-in value is a number, we're going to assume it's already a
		// tick-count value (milliseconds since epoch).
		if ( typeof( value ) === "number" ) {

			return( value );

		}

		return( new Date( value ).getTime() );

	}

  public isValidDate(date) {
    return date && Object.prototype.toString.call(date) === "[object Date]" && !isNaN(date);
  }

    // Helper to format time in 'HH:mm' format
     formatTime(date: Date): string {
      const hours = date.getHours().toString().padStart(2, '0');
      const minutes = date.getMinutes().toString().padStart(2, '0');
      return `${hours}:${minutes}`;
    }

    // Helper function to format time in "HH:mm AM/PM" format
    formatTimeOnly(date: Date): string {
      const hours = date.getHours();
      const minutes = date.getMinutes().toString().padStart(2, '0');
      const ampm = hours >= 12 ? 'PM' : 'AM';

      // Adjust hours to 12-hour format
      const formattedHours = hours % 12 || 12;

      return `${formattedHours}:${minutes} ${ampm}`;
    }
      /**
     * Helper function to format time from 24-hour (HH:MM) to 12-hour with AM/PM
     * @param timeString - The time in 24-hour format (e.g., "14:05")
     * @returns The time formatted in 12-hour with AM/PM (e.g., "02:05 PM")
     */
    formatTimeTo12Hour(timeString: string): string {
      if (!timeString) return '';

      const [hours, minutes] = timeString.split(':').map(Number);
      const suffix = hours >= 12 ? 'PM' : 'AM';
      const hours12 = ((hours + 11) % 12 + 1);  // Convert 24-hour to 12-hour format

      return `${this.padZero(hours12)}:${this.padZero(minutes)} ${suffix}`;
    }

  /**
   * Function to validate a date against a date range, time range, and excluded dates
   * @param selectedDate The date selected from the date-time picker (as a Date object)
   * @param dateRanges Array of DateRangeValidator containing allowed date ranges (date strings)
   * @param timeRanges Array of DayTimeRangeValidator containing allowed time ranges for each day of the week
   * @param excludedDates Array of DateRangeValidator containing excluded date ranges (date strings)
   * @returns boolean whether the selected date is valid
   */
  validateDateTime(selectedDate: Date, dateRanges: DateRangeValidator[], timeRanges: DayTimeRangeValidator[], excludedDates: DateRangeValidator[]): boolean {
    const selectedDay = selectedDate.getDay(); // 0 = Sunday, 6 = Saturday
    const selectedTime = `${this.padZero(selectedDate.getHours())}:${this.padZero(selectedDate.getMinutes())}`;

    // Check if the selected date is in any excluded date ranges
    if (excludedDates && excludedDates.length > 0) {
      const isExcluded = excludedDates.some(range => {
        // Ensure startDate and endDate are defined and valid
        if (!range.startDate || !range.endDate) {
          return false; // Skip if dates are not valid
        }

        const startDate = new Date(range.startDate);
        const endDate = new Date(range.endDate);

        // Check if the selected date is within the excluded range
        return selectedDate >= startDate && selectedDate <= endDate;
      });

      if (isExcluded) {
        console.log('Selected date is within excluded date range');
        return false; // Fail if in excluded date range
      }
    }

    // Check if there are valid Date Ranges defined
    if (dateRanges && dateRanges.length > 0) {
      const isInDateRange = dateRanges.some(range => {
        // Ensure startDate and endDate are defined and valid
        if (!range.startDate || !range.endDate) {
          return false; // Skip this range if dates are not valid
        }

        const startDate = new Date(range.startDate);
        const endDate = new Date(range.endDate);

        // Check if the selected date is within the range
        return selectedDate >= startDate && selectedDate <= endDate;
      });

      if (!isInDateRange) {
        console.log('Selected date is not within allowed date range');
        return false; // Fail if not in date range
      }
    }

    // Check if there are valid Time Ranges defined for the specific day
    if (timeRanges && timeRanges.length > 0) {
      const dayTimeRange = timeRanges.find(range => range.day === this.getDayString(selectedDay));

      // If the day is disabled, it should fail validation
      if (dayTimeRange?.disabled) {
        console.log(`Day ${this.getDayString(selectedDay)} is disabled.`);
        return false; // Fail if the entire day is disabled
      }

      // If a time range is defined for the day and it is not disabled, check the time ranges
      if (dayTimeRange && dayTimeRange.timeRanges.length > 0) {
        const isInTimeRange = dayTimeRange.timeRanges.some(timeRange => {
          // Skip if startTime or endTime are missing
          if (!timeRange.startTime || !timeRange.endTime) {
            return false;
          }

          return this.isTimeWithinRange(selectedTime, timeRange.startTime, timeRange.endTime);
        });

        if (!isInTimeRange) {
          console.log('Selected time is not within allowed time range');
          return false; // Fail if not in time range
        }
      }
    }

    return true; // Valid if all checks pass
  }


    /**
     * Helper to compare two dates, ignoring the time part
     * @param date1 First date to compare
     * @param date2 Second date to compare
     * @returns boolean whether the two dates are the same (ignoring time)
     */
    private isSameDate(date1: Date, date2: Date): boolean {
      return date1.getFullYear() === date2.getFullYear() &&
            date1.getMonth() === date2.getMonth() &&
            date1.getDate() === date2.getDate();
    }



  /**
   * Helper to check if a time is within a time range
   * @param selectedTime The time of the selected date in "HH:MM" format
   * @param startTime Start time of the allowed range in "HH:MM" format
   * @param endTime End time of the allowed range in "HH:MM" format
   * @returns boolean whether the time is within the range
   */
  private isTimeWithinRange(selectedTime: string, startTime: string, endTime: string): boolean {
    return selectedTime >= startTime && selectedTime <= endTime;
  }

  /**
   * Helper to convert numeric day (0-6) to weekday string
   * @param day Numeric day (0 = Sunday, 6 = Saturday)
   * @returns String name of the weekday
   */
  private getDayString(day: number): string {
    const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
    return days[day];
  }

  /**
   * Helper to pad time values with leading zero if needed
   * @param num Number to be padded
   * @returns String with padded number (e.g., 9 -> '09')
   */
  private padZero(num: number): string {
    return num < 10 ? `0${num}` : `${num}`;
  }

   formatToISO(date: Date): string {
    const year = date.getFullYear();
    const month = (date.getMonth() + 1).toString().padStart(2, '0');
    const day = date.getDate().toString().padStart(2, '0');

    const hours = date.getHours().toString().padStart(2, '0');
    const minutes = date.getMinutes().toString().padStart(2, '0');
    const seconds = date.getSeconds().toString().padStart(2, '0');
    const milliseconds = date.getMilliseconds().toString().padStart(3, '0');

    return `${year}-${month}-${day}T${hours}:${minutes}:${seconds}.${milliseconds}`;
  }


  formatDateTime(date: Date | null | undefined): string {
    if (!date || !(date instanceof Date) || isNaN(date.getTime())) {
      console.warn('Invalid date object provided:', date);
      return 'Invalid Date';
    }

    const months = (date.getMonth() + 1).toString().padStart(2, '0');
    const days = date.getDate().toString().padStart(2, '0');
    const years = date.getFullYear();

    let hours = date.getHours();
    const minutes = date.getMinutes().toString().padStart(2, '0');
    const ampm = hours >= 12 ? 'PM' : 'AM';

    // Convert hours to 12-hour format
    hours = hours % 12;
    hours = hours ? hours : 12; // '0' should be '12'

    const formattedTime = `${hours}:${minutes} ${ampm}`;
    return `${months}/${days}/${years} ${formattedTime}`;
  }

  parseFormattedDateTime(dateString: string | null | undefined): Date | null {
    if (!dateString || typeof dateString !== 'string') {
      console.warn('Invalid date string:', dateString);
      return null;
    }

    // Check if the input is in ISO 8601 format
    const isoDate = new Date(dateString);
    if (!isNaN(isoDate.getTime())) {
      return isoDate;
    }

    // Handle custom MM/DD/YYYY HH:mm AM/PM format
    const parts = dateString.split(' '); // Split into date, time, and AM/PM parts
    if (parts.length < 3) {
      console.warn('Date string format is incorrect:', dateString);
      return null;
    }

    const [datePart, timePart, ampm] = parts;
    const dateSegments = datePart.split('/').map(Number);
    if (dateSegments.length !== 3) {
      console.warn('Invalid date format:', datePart);
      return null;
    }
    const [month, day, year] = dateSegments;

    const timeSegments = timePart.split(':').map(Number);
    if (timeSegments.length !== 2) {
      console.warn('Invalid time format:', timePart);
      return null;
    }
    let [hours, minutes] = timeSegments;

    // Convert to 24-hour format if needed
    if (ampm === 'PM' && hours < 12) hours += 12;
    if (ampm === 'AM' && hours === 12) hours = 0;

    const date = new Date(year, month - 1, day, hours, minutes);
    return isNaN(date.getTime()) ? null : date; // Return null if the date is invalid
  }


}
