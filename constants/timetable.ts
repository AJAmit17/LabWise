export interface TimeTableSlot {
    time: string;
    subject: string;
    courseCode: string;
    teacher: string;
}

export interface DaySchedule {
    [key: string]: TimeTableSlot[];
}

export interface TimetableData {
    [department: string]: {
        [year: string]: {
            [semester: string]: {
                [section: string]: DaySchedule;
            };
        };
    };
}

export const timetableData: TimetableData = {
    // Department
    "CSE-DS": {
        // Year 
        "3": {
            // Semester
            "6": {
                // Section
                "A": {
                    "Monday": [
                        { time: "9:00 - 12:00", subject: "Open Elective", courseCode: "-", teacher: "-" },
                        { time: "12:00 - 01:00", subject: "Predictive Analytics / Software testing", courseCode: "22CDS642 / 22CDS645", teacher: "Ms.Kavitha U / Ms.T Sasikala" },
                        { time: "1:00 - 2:00", subject: "Lunch Break", courseCode: "-", teacher: "-" },
                        { time: "2:00 - 3:00", subject: "AI/ML", courseCode: "22CDS61", teacher: "Ms.Pallavi Nayak" },
                        { time: "3:00 - 3:55", subject: "Computer Networks", courseCode: "22CDS62", teacher: "Ms.Kavitha U" },
                        { time: "3:55 - 4:50", subject: "Open Elective", courseCode: "-", teacher: "-" },
                    ],
                    "Tuesday": [
                        { time: "9:00 - 9:55", subject: "Cyber Security", courseCode: "22CDS63", teacher: "Ms.Anju K" },
                        { time: "9:55 - 10:50", subject: "AI/ML", courseCode: "22CDS61", teacher: "Ms.Pallavi" },
                        { time: "10:50 - 11:00", subject: "Short Break", courseCode: "-", teacher: "-" },
                        { time: "11:00 - 12:00", subject: "Computer Networks", courseCode: "22CDS62", teacher: "Ms.Kavitha U" },
                        { time: "12:00 - 01:00", subject: "Predictive Analytics / Software testing", courseCode: "22CDS642 / 22CDS645", teacher: "Ms.Kavitha U / Ms.T Sasikala" },
                        { time: "1:00 - 2:00", subject: "Lunch Break", courseCode: "-", teacher: "-" },
                        { time: "2:00 - 4:50", subject: "Open Elective", courseCode: "-", teacher: "-" },
                    ],
                    "Wednesday": [
                        { time: "9:00 - 12:00", subject: "AI/ML Lab (A1) / CN Lab (A2)", courseCode: "22CDL61 / 22CDL62", teacher: "Ms.Pallavi Nayak / Ms.Kavitha U" },
                        { time: "12:00 - 1:00", subject: "Computer Networks", courseCode: "22CDS62", teacher: "Ms.Kavitha U" },
                        { time: "01:00 - 02:00", subject: "Lunch Break", courseCode: "-", teacher: "-" },
                        { time: "2:00 - 3:00", subject: "Cyber Security", courseCode: "22CDS63", teacher: "Ms.Anju K" },
                        { time: "3:00 - 4:50", subject: "MAD Lab (A1)", courseCode: "22CDS671", teacher: "Ms. Swati Sehgal" },
                    ],
                    "Thursday": [
                        { time: "9:00 - 10:50", subject: "Placement Class", courseCode: "-", teacher: "Mr. Dilip" },
                        { time: "10:50 - 11:00", subject: "Short Break", courseCode: "-", teacher: "-" },
                        { time: "11:00 - 12:00", subject: "AI/ML", courseCode: "22CDS61", teacher: "Ms.Pallavi" },
                        { time: "12:00 - 01:00", subject: "Predictive Analytics / Software testing", courseCode: "22CDS642 / 22CDS645", teacher: "Ms.Kavitha U / Ms.T Sasikala" },
                        { time: "01:00 - 02:00", subject: "Lunch Break", courseCode: "-", teacher: "-" },
                        { time: "2:00 - 3:00", subject: "Cyber Security", courseCode: "22CDS63", teacher: "Ms.Anju K" },
                        { time: "3:00 - 4:50", subject: "MAD Lab (A2)", courseCode: "22CDS671", teacher: "Ms. Swati Sehgal" },
                    ],
                    "Friday": [
                        { time: "9:00 - 12:00", subject: "AI/ML Lab (A2) / CN Lab (A1)", courseCode: "22CDL61 / 22CDL62", teacher: "Ms.Pallavi Nayak / Ms.Kavitha U" },
                        { time: "12:00 - 01:00", subject: "Predictive Analytics / Software testing", courseCode: "22CDS642 / 22CDS645", teacher: "Ms.Kavitha U / Ms.T Sasikala" },
                        { time: "01:00 - 02:00", subject: "Lunch Break", courseCode: "-", teacher: "-" },
                        { time: "2:00 - 3:00", subject: "AI/ML", courseCode: "22CDS61", teacher: "Ms.Pallavi Nayak" },
                        { time: "3:00 - 3:55", subject: "Cyber Security", courseCode: "22CDS63", teacher: "Ms.Anju K" },
                        { time: "3:55 - 4:50", subject: "Computer Networks", courseCode: "22CDS62", teacher: "Ms.Kavitha U" },
                    ]
                },
                "B": {
                    "Monday": [
                        { time: "9:00 - 12:00", subject: "AI/ML Lab (B1) / CN Lab (B2)", courseCode: "22CDL61 / 22CDL62", teacher: "Dr.R Suganya / Ms.Anchal" },
                        { time: "12:00 - 01:00", subject: "Predictive Analytics / Software Testing", courseCode: "22CDS642 / 22CDS645", teacher: "Ms. Kavitha U / Mr. Sankhadeep Pujaru" },
                        { time: "01:00 - 02:00", subject: "Lunch Break", courseCode: "-", teacher: "-" },
                        { time: "2:00 - 3:55", subject: "MAD Lab (B1)", courseCode: "22CDS671", teacher: "Ms. Swati Sehgal" },
                        { time: "3:55 - 4:50", subject: "Open Elective", courseCode: "-", teacher: "-" }
                    ],
                    "Tuesday": [
                        { time: "9:00 - 10:50", subject: "MAD Lab (B2)", courseCode: "22CDS671", teacher: "Ms. Swati Sehgal" },
                        { time: "10:50 - 11:00", subject: "Short Break", courseCode: "-", teacher: "-" },
                        { time: "11:00 - 12:00", subject: "Computer Networks", courseCode: "22CDS62", teacher: "Ms.Pallavi Nayak" },
                        { time: "12:00 - 01:00", subject: "Predictive Analytics / Software Testing", courseCode: "22CDS642 / 22CDS645", teacher: "Ms. Kavitha U / Mr. Sankhadeep Pujaru" },
                        { time: "01:00 - 02:00", subject: "Lunch Break", courseCode: "-", teacher: "-" },
                        { time: "2:00 - 4:50", subject: "Open Elective", courseCode: "-", teacher: "-" },
                    ],
                    "Wednesday": [
                        { time: "9:00 - 9:55", subject: "Cyber Security", courseCode: "22CDS63", teacher: "Ms.Anchal" },
                        { time: "9:55 - 10:50", subject: "Cyber Security", courseCode: "22CDS63", teacher: "Ms.Anchal" },
                        { time: "10:50 - 11:00", subject: "Short Break", courseCode: "-", teacher: "-" },
                        { time: "11:00 - 12:00", subject: "AI/ML", courseCode: "22CDS61", teacher: "Dr.R Suganya" },
                        { time: "12:00 - 1:00", subject: "Computer Networks", courseCode: "22CDS62", teacher: "Ms.Pallavi Nayak" },
                        { time: "01:00 - 02:00", subject: "Lunch Break", courseCode: "-", teacher: "-" },
                        { time: "2:00 - 3:00", subject: "Computer Networks", courseCode: "22CDS62", teacher: "Ms.Pallavi Nayak" },
                        { time: "3:00 - 3:55", subject: "AI/ML", courseCode: "22CDS61", teacher: "Dr.R Suganya" },
                        { time: "3:55 - 4:50", subject: "Open Elective", courseCode: "-", teacher: "-" },

                    ],
                    "Thursday": [
                        { time: "9:00 - 12:00", subject: "AI/ML Lab(B2) / CN Lab(B1)", courseCode: "22CDLS61 / 22CDL62", teacher: "Dr.R Suganya / Ms.Anchal" },
                        { time: "12:00 - 01:00", subject: "Predictive Analytics / Software Testing", courseCode: "22CDS642 / 22CDS645", teacher: "Ms. Kavitha U / Mr. Sankhadeep Pujaru" },
                        { time: "01:00 - 02:00", subject: "Lunch Break", courseCode: "-", teacher: "-" },
                        { time: "2:00 - 4:50", subject: "Open Elective", courseCode: "-", teacher: "-" },
                    ],
                    "Friday": [
                        { time: "8:00 - 9:00", subject: "AI/ML", courseCode: "22CDS61", teacher: "Dr.R Suganya" },
                        { time: "9:00 - 10:50", subject: "Placement Class", courseCode: "-", teacher: "Mr.Dilip" },
                        { time: "10:50 - 11:00", subject: "Short Break", courseCode: "-", teacher: "-" },
                        { time: "11:00 - 12:00", subject: "Cyber Security", courseCode: "22CDS63", teacher: "Ms.Anchal" },
                        { time: "12:00 - 01:00", subject: "Predictive Analytics / Software Testing", courseCode: "22CDS642 / 22CDS645", teacher: "Ms. Kavitha U / Mr. Sankhadeep Pujaru" },
                        { time: "01:00 - 02:00", subject: "Lunch Break", courseCode: "-", teacher: "-" },
                        { time: "2:00 - 3:00", subject: "AI/ML", courseCode: "22CDS61", teacher: "Dr.R Suganya" },
                        { time: "3:00 - 3:55", subject: "Cyber Security", courseCode: "22CDS63", teacher: "Ms. Anchal" },
                        { time: "3:55 - 4:50", subject: "Computer Networks", courseCode: "22CDS62", teacher: "Ms.Pallavi Nayak" },
                    ]
                }
            }
        }
    },
    // "CSE": {
    //     "2": {
    //         "3": {
    //             "A": {
    //                 "Monday": [
    //                     { time: "9:00 - 10:00", subject: "Data Structures", courseCode: "18CS32", teacher: "Dr. Ravi Kumar" },
    //                     { time: "10:00 - 11:00", subject: "Computer Networks", courseCode: "18CS33", teacher: "Prof. Meena S" },
    //                     { time: "11:00 - 12:00", subject: "Operating Systems", courseCode: "18CS34", teacher: "Dr. Prakash J" },
    //                     { time: "12:00 - 1:00", subject: "Lunch Break", courseCode: "-", teacher: "-" },
    //                     { time: "1:00 - 3:00", subject: "DS Lab", courseCode: "18CSL37", teacher: "Multiple Faculty" }
    //                 ],
    //                 "Tuesday": [
    //                     { time: "9:00 - 11:00", subject: "CN Lab", courseCode: "18CSL38", teacher: "Multiple Faculty" },
    //                     { time: "11:00 - 12:00", subject: "DBMS", courseCode: "18CS35", teacher: "Dr. Sudha R" },
    //                     { time: "12:00 - 1:00", subject: "Lunch Break", courseCode: "-", teacher: "-" },
    //                     { time: "1:00 - 2:00", subject: "Data Structures", courseCode: "18CS32", teacher: "Dr. Ravi Kumar" },
    //                     { time: "2:00 - 3:00", subject: "Computer Networks", courseCode: "18CS33", teacher: "Prof. Meena S" }
    //                 ],
    //                 "Wednesday": [
    //                     { time: "9:00 - 10:00", subject: "Operating Systems", courseCode: "18CS34", teacher: "Dr. Prakash J" },
    //                     { time: "10:00 - 11:00", subject: "DBMS", courseCode: "18CS35", teacher: "Dr. Sudha R" },
    //                     { time: "11:00 - 12:00", subject: "Data Structures", courseCode: "18CS32", teacher: "Dr. Ravi Kumar" },
    //                     { time: "12:00 - 1:00", subject: "Lunch Break", courseCode: "-", teacher: "-" },
    //                     { time: "1:00 - 3:00", subject: "OS Lab", courseCode: "18CSL39", teacher: "Multiple Faculty" }
    //                 ],
    //                 "Thursday": [
    //                     { time: "9:00 - 10:00", subject: "Computer Networks", courseCode: "18CS33", teacher: "Prof. Meena S" },
    //                     { time: "10:00 - 11:00", subject: "Operating Systems", courseCode: "18CS34", teacher: "Dr. Prakash J" },
    //                     { time: "11:00 - 12:00", subject: "DBMS", courseCode: "18CS35", teacher: "Dr. Sudha R" },
    //                     { time: "12:00 - 1:00", subject: "Lunch Break", courseCode: "-", teacher: "-" },
    //                     { time: "1:00 - 3:00", subject: "DBMS Lab", courseCode: "18CSL36", teacher: "Multiple Faculty" }
    //                 ],
    //                 "Friday": [
    //                     { time: "9:00 - 10:00", subject: "Data Structures", courseCode: "18CS32", teacher: "Dr. Ravi Kumar" },
    //                     { time: "10:00 - 11:00", subject: "Computer Networks", courseCode: "18CS33", teacher: "Prof. Meena S" },
    //                     { time: "11:00 - 12:00", subject: "Operating Systems", courseCode: "18CS34", teacher: "Dr. Prakash J" },
    //                     { time: "12:00 - 1:00", subject: "Lunch Break", courseCode: "-", teacher: "-" },
    //                     { time: "1:00 - 2:00", subject: "DBMS", courseCode: "18CS35", teacher: "Dr. Sudha R" },
    //                     { time: "2:00 - 3:00", subject: "Technical Seminar", courseCode: "18CS36", teacher: "Prof. Anil K" }
    //                 ]
    //             }
    //         }
    //     }
    // }
};

export const departments = [
    "CSE-DS",
    // "CSE",
    // "ISE",
    // "ECE",
    // "EEE",
    // "MECH"
];

export const years = ["1", "2", "3", "4"];

export const semesters: { [key: string]: string[] } = {
    "1": ["1", "2"],
    "2": ["3", "4"],
    "3": ["5", "6"],
    "4": ["7", "8"]
};

export const sections = ["A", "B", "C", "D", "E"];

export const weekDays = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"];
