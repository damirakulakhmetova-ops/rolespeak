// Black Friday offer: Pro for $79 instead of $149, Nov 27 – Dec 1, 2026.
// Dates are in the visitor's local time. After the end the offer disappears
// automatically and Pro goes back to $149. Exam Pass never changes.

export const BF_DISMISS_KEY = "rolespeak.bfDismissed";

// Month is 0-based: 10 = November, 11 = December.
export const bfStart = () => new Date(2026, 10, 27, 0, 0, 0, 0).getTime();
export const bfEnd = () => new Date(2026, 11, 1, 23, 59, 59, 999).getTime();

/** Offer still shown (before or during the sale). */
export const bfLive = (now = Date.now()) => now <= bfEnd();

/**
 * Runs before first paint: hides the banner if dismissed, and removes the
 * discount once the local end date has passed. Classes go on <html>.
 */
export const BF_INLINE_SCRIPT = `(function(){try{var d=document.documentElement;if(Date.now()>new Date(2026,11,1,23,59,59,999).getTime()){d.classList.add("bf-ended","bf-hide")}else if(localStorage.getItem("${BF_DISMISS_KEY}")==="1"){d.classList.add("bf-hide")}}catch(e){}})()`;
