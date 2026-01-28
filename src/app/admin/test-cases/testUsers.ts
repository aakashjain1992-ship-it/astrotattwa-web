export type TestUser = {
  name: string;
  birthDate: string;
  birthTime: string; // HH:MM
  timezone: string;
  city: string;
};

export const TEST_USERS: TestUser[] = [
  { name: "Aakash Jain", birthDate: "1992-03-25", birthTime: "11:55", timezone: "Asia/Kolkata", city: "Delhi, India" },
  { name: "Garima Jain", birthDate: "1992-04-08", birthTime: "15:00", timezone: "Asia/Kolkata", city: "Baghpat, India" },
  { name: "Gaurav Jain", birthDate: "1983-07-18", birthTime: "16:35", timezone: "Asia/Kolkata", city: "Meerut, India" },
  { name: "Manjusha", birthDate: "1991-09-06", birthTime: "19:30", timezone: "Asia/Kolkata", city: "Delhi, India" },
  { name: "Abhishek Jain", birthDate: "1985-02-12", birthTime: "03:45", timezone: "Asia/Kolkata", city: "Delhi, India" },
  { name: "Rahul Jain", birthDate: "1985-12-12", birthTime: "23:05", timezone: "Asia/Kolkata", city: "Baghpat, India" },
  { name: "Shravan", birthDate: "1992-02-28", birthTime: "21:23", timezone: "Asia/Kolkata", city: "Jammu, India" },
  { name: "Gurvani", birthDate: "1993-06-25", birthTime: "07:45", timezone: "Asia/Kolkata", city: "Vadodara, India" },
  { name: "Umang Jain", birthDate: "1992-04-22", birthTime: "23:20", timezone: "Asia/Kolkata", city: "Meerut, India" },
  { name: "Kapil Jain", birthDate: "1988-08-29", birthTime: "17:35", timezone: "Asia/Kolkata", city: "Baghpat, India" },
];
