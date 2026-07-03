import { db } from "./firebase";

import { doc, getDoc, collection, query, where, getDocs } from "firebase/firestore";

export const AUTHORIZED_ADMIN_EMAILS = ["info.colormytrip@gmail.com"];
export const AUTHORIZED_AFFILIATE_EMAILS = ["ratnadeepmukherjee.banti@gmail.com"];

export function isAuthorizedAdminEmail(email?: string | null): boolean {
  if (!email) {
    return false;
  }

  const normalizedEmail = email.trim().toLowerCase();
  return AUTHORIZED_ADMIN_EMAILS.some((allowedEmail) => allowedEmail.toLowerCase() === normalizedEmail);
}

export function isAuthorizedAffiliateEmail(email?: string | null): boolean {
  if (!email) {
    return false;
  }

  const normalizedEmail = email.trim().toLowerCase();
  return AUTHORIZED_AFFILIATE_EMAILS.some((allowedEmail) => allowedEmail.toLowerCase() === normalizedEmail);
}

export async function resolveRoleByUid(uid: string, email?: string | null): Promise<
  | { role: "public" }
  | { role: "admin" }
  | { role: "affiliate"; affiliateId?: string }
> {
  if (isAuthorizedAdminEmail(email)) {
    return { role: "admin" };
  }

  try {
    const ref = doc(db!, "users", uid);
    const snap = await getDoc(ref);

    if (snap.exists()) {
      const data = snap.data() as {
        role?: string;
        affiliateId?: string;
        status?: string;
      };

      // Respect disabled users
      if (data.status === "Disabled") {
        return { role: "public" };
      }

      const role = data.role;

      if (role === "admin") {
        return { role: "admin" };
      }

      if (role === "affiliate") {
        return { role: "affiliate", affiliateId: data.affiliateId };
      }
    }
  } catch (e) {
    console.warn("Could not read user doc (may not exist yet):", e);
    // Fall through to affiliate lookup
  }

  // Dynamic affiliate lookup: check affiliates collection by email
  if (email) {
    try {
      const trimmedEmail = email.trim();
      const affQ = query(collection(db!, "affiliates"), where("email", "==", trimmedEmail));
      const affSnap = await getDocs(affQ);
      if (!affSnap.empty) {
        return { role: "affiliate", affiliateId: affSnap.docs[0].id };
      }

      const affQ2 = query(collection(db!, "affiliates"), where("email", "==", trimmedEmail.toLowerCase()));
      const affSnap2 = await getDocs(affQ2);
      if (!affSnap2.empty) {
        return { role: "affiliate", affiliateId: affSnap2.docs[0].id };
      }
    } catch (e) {
      console.warn("Could not query affiliates collection:", e);
      // Fall through to hardcoded fallback
    }
  }

  // Hardcoded fallback for the default test affiliate email
  if (isAuthorizedAffiliateEmail(email)) {
    return { role: "affiliate", affiliateId: "test-affiliate" };
  }

  return { role: "public" };
}

