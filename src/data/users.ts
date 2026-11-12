export interface DashboardUser {
  id: string;
  name: string;
  username: string;
  email: string;
  avatar: string;
  role: string;
}

export const users: DashboardUser[] = [
  {
    id: "daet-admin-default",
    name: "Daet Heritage Admin",
    username: "daet_admin",
    email: "admin@daet.gov.ph",
    avatar: "",
    role: "Administrator",
  },
];

export const rootUser = users[0];
