/**
 * TEMPORARY demo switch. While on, a new registration is signed in straight away (no admin approval wait)
 * and the person may open either the volunteer app or a read-only-by-design "admin preview" on seeded demo data.
 *
 * To restore the approval workflow, set NEXT_PUBLIC_INSTANT_ACCESS=false and rebuild (it is read at build time).
 * Nothing else needs to change: applications, the approval queue and the applicant gate are all still in place.
 *
 * This is a front-end prototype with no server. The switch only changes what the UI shows; it is not a security
 * control. Real admin rights must come from server-verified accounts and be enforced on the server.
 */
export const INSTANT_ACCESS = process.env.NEXT_PUBLIC_INSTANT_ACCESS !== "false";
