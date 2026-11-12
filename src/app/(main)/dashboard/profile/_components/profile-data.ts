interface PersonReference {
  name: string;
  role: string;
  initials: string;
}

export interface ProfileDocument {
  id: string;
  name: string;
  category: string;
  updatedAt: string;
  status: "Signed" | "Current";
  isRestricted: boolean;
}

export interface ProfileRecord {
  name: string;
  preferredName: string;
  legalName: string;
  pronouns: string;
  initials: string;
  avatar: string;
  engagementStatus: "Active";
  jobTitle: string;
  jobLevel: string;
  department: string;
  team: string;
  currentProject: string;
  workEmail: string;
  personalEmail: string;
  workPhone: string;
  workplace: string;
  timeZone: string;
  contractorId: string;
  startDate: string;
  engagementLength: string;
  employmentType: string;
  weeklyHours: string;
  schedule: string;
  contractingEntity: string;
  noticePeriod: string;
  dateOfBirth: string;
  address: string;
  emergencyContact: string;
  emergencyPhone: string;
  manager: PersonReference;
  bio: string;
  leavePolicy: string;
  annualLeaveAllowance: string;
  remainingLeave: string;
  carriedOverLeave: string;
  usedLeave: string;
  scheduledLeave: string;
  pendingLeaveRequests: string;
  leaveYear: string;
  nextLeave: string;
  lastWorkingDay: string;
  updatedBy: string;
  updatedAt: string;
  documents: ProfileDocument[];
}

export const profile: ProfileRecord = {
  name: "Daet Heritage Admin",
  preferredName: "Administrator",
  legalName: "Cultural Heritage Administrator",
  pronouns: "They / them",
  initials: "DH",
  avatar: "",
  engagementStatus: "Active",
  jobTitle: "Cultural Heritage Administrator",
  jobLevel: "Senior Official",
  department: "Municipal Tourism & Culture",
  team: "Heritage Preservation Office",
  currentProject: "Daet Immersive Cultural Heritage Experience",
  workEmail: "admin@daet.gov.ph",
  personalEmail: "heritage@daet.gov.ph",
  workPhone: "+63 (54) 721-2000",
  workplace: "Daet Municipal Hall",
  timeZone: "UTC+08:00 (PHT)",
  contractorId: "DCO-2026",
  startDate: "January 1, 2024",
  engagementLength: "2 years, 8 months",
  employmentType: "Permanent / Municipal Officer",
  weeklyHours: "40 hours",
  schedule: "Monday–Friday · 8:00 AM–5:00 PM",
  contractingEntity: "Municipality of Daet, Camarines Norte",
  noticePeriod: "30 days",
  dateOfBirth: "June 15, 1988",
  address: "Daet Municipal Hall, J. Lukban St, Daet, 4600 Camarines Norte",
  emergencyContact: "Municipal Disaster Risk Reduction Office",
  emergencyPhone: "+63 (54) 721-2999",
  manager: {
    name: "Office of the Mayor",
    role: "Municipal Mayor",
    initials: "OM",
  },
  bio: "Overseeing the digital preservation, curation, photogrammetry scanning, and 360-degree panoramic documentation of Daet's historical and cultural heritage landmarks in Camarines Norte, Philippines.",
  leavePolicy: "Civil Service Commission Leave Policy",
  annualLeaveAllowance: "15 days",
  remainingLeave: "12 days",
  carriedOverLeave: "0 days",
  usedLeave: "3 days",
  scheduledLeave: "0 days",
  pendingLeaveRequests: "0",
  leaveYear: "January 1–December 31, 2026",
  nextLeave: "None scheduled",
  lastWorkingDay: "N/A",
  updatedBy: "Daet Heritage Admin",
  updatedAt: "September 7, 2026",
  documents: [
    {
      id: "doc-1",
      name: "Contractor agreement",
      category: "Contract",
      updatedAt: "Mar 18, 2022",
      status: "Signed",
      isRestricted: false,
    },
    {
      id: "doc-2",
      name: "Confidentiality agreement",
      category: "Compliance",
      updatedAt: "Mar 18, 2022",
      status: "Signed",
      isRestricted: true,
    },
    {
      id: "doc-4",
      name: "Information security policy acknowledgement",
      category: "Policy",
      updatedAt: "Jan 8, 2026",
      status: "Current",
      isRestricted: false,
    },
  ],
};
