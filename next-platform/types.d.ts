import { DefaultSession } from "next-auth";

declare module "next-auth" {
  interface Session {
    user: {
      id: string;
      role: string;
      tier: string;
      isApproved: boolean;
      isBlocked: boolean;
      advisorId?: string | null;
      agencyName?: string | null;
      agencyPhone?: string | null;
      agencyLogoUrl?: string | null;
      leadStatus?: string | null;
      residencyState?: string | null;
      operationState?: string | null;
      remoteReady?: boolean;
      age?: number | null;
      currentWeeks?: number | null;
      avgSalary?: number | null;
      lastBajaDate?: string | Date | null;
      nss?: string | null;
      birthDate?: string | Date | null;
      isWorking?: boolean;
    } & DefaultSession["user"];
  }

  interface User {
    id: string;
    role: string;
    tier: string;
    isApproved: boolean;
    isBlocked: boolean;
    advisorId?: string | null;
    agencyName?: string | null;
    agencyPhone?: string | null;
    agencyLogoUrl?: string | null;
    leadStatus?: string | null;
    residencyState?: string | null;
    operationState?: string | null;
    remoteReady?: boolean;
    age?: number | null;
    currentWeeks?: number | null;
    avgSalary?: number | null;
    lastBajaDate?: string | Date | null;
    nss?: string | null;
    birthDate?: string | Date | null;
    isWorking?: boolean;
  }
}
