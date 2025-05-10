document.addEventListener('DOMContentLoaded', () => {
    // --- Global Variables & Mock Data ---
    const MOCK_TEACHERS = {
        "T001": {
            password: "password123", // In a real app, NEVER store plain text passwords
            name: "Dr. Emily Carter",
            about: "PhD in Physics with 10 years of teaching experience. Passionate about quantum mechanics.",
            timetable: [
                { day: "Monday", time: "09:00 AM - 10:00 AM", subject: "Physics", class: "XA", room: "Lab 1" },
                { day: "Monday", time: "11:00 AM - 12:00 PM", subject: "Advanced Physics", class: "XIIB", room: "Lab 1" },
                { day: "Tuesday", time: "10:00 AM - 11:00 AM", subject: "Physics", class: "XA", room: "Lab 1" },
            ],
            attendance: [
                { date: "2025-05-07", status: "Present" },
                { date: "2025-05-08", status: "Absent", reason: "Sick Leave" },
                { date: "2025-05-09", status: "Present", note: "Invigilation Duty 10 AM - 1 PM" },
            ],
            salary: {
                base: 60000,
                experienceYears: 10,
                degree: "PhD",
                skills: ["Quantum Physics", "Lab Management", "Curriculum Design"],
                studentReviewAvg: 4.5
            }
        },
        "T002": {
            password: "mypassword",
            name: "Mr. John Davis",
            about: "M.Sc. in Mathematics, 5 years experience. Enjoys making math fun and accessible.",
            timetable: [
                { day: "Monday", time: "10:00 AM - 11:00 AM", subject: "Mathematics", class: "IXA", room: "Room 101" },
                { day: "Wednesday", time: "01:00 PM - 02:00 PM", subject: "Calculus", class: "XIC", room: "Room 102" },
            ],
            attendance: [
                { date: "2025-05-07", status: "Present" },
                { date: "2025-05-08", status: "Present" },
                { date: "2025-05-09", status: "Present" },
            ],
            salary: {
                base: 50000,
                experienceYears: 5,
                degree: "M.Sc.",
                skills: ["Algebra", "Calculus", "Problem Solving"],
                studentReviewAvg: 4.2
            }
        }
    };

    const MOCK_ALL_TEACHERS_INFO = [ // For timetable and attendance overview
        { name: "Dr. Emily Carter", subject: "Physics", status: "Available" },
        { name: "Mr. John Davis", subject: "Mathematics", status: "Teaching Class IXA" },
        { name: "Ms. Aisha Khan", subject: "Chemistry", status: "On Leave" },
        { name: "Prof. Robert Brown", subject: "Biology", status: "Invigilation Duty - Hall A" }
    ];

    const MOCK_SUBSTITUTES = { // Subject: [Available Teachers]
        "Physics": ["Mr. Alex Green (Physics)", "Ms. Sarah Jenkins (General Science)"],
        "Mathematics": ["Ms. Linda Blue (Mathematics)", "Mr. Kevin White (Statistics)"],
        "Chemistry": ["Dr. Walter Black (Chemistry)"],
        // Add more subjects and substitutes
    };


    // --- Helper Functions ---
    function getLoggedInTeacher() {
        return localStorage.getItem('loggedInTeacherRegNo');
    }

    function storeLoggedInTeacher(regNo) {
        localStorage.setItem('loggedInTeacherRegNo', regNo);
    }

    function clearLoggedInTeacher() {
        localStorage.removeItem('loggedInTeacherRegNo');
    }

    // --- Login Page Logic (`index.html`) ---
    const loginForm = document.getElementById('loginForm');
    if (loginForm) {
        loginForm.addEventListener('submit', (event) => {
            event.preventDefault();
            const regNo = document.getElementById('regNo').value;
            const password = document.getElementById('password').value;
            const loginError = document.getElementById('loginError');

            if (MOCK_TEACHERS[regNo] && MOCK_TEACHERS[regNo].password === password) {
                storeLoggedInTeacher(regNo);
                window.location.href = 'dashboard.html'; // Redirect to dashboard
            } else {
                loginError.textContent = 'Invalid Registration No. or Password.';
            }
        });
    }

    // --- Dashboard Page Logic (`dashboard.html`) ---
    if (document.body.contains(document.getElementById('teacherName'))) { // Check if on dashboard
        const loggedInRegNo = getLoggedInTeacher();
        if (!loggedInRegNo || !MOCK_TEACHERS[loggedInRegNo]) {
            window.location.href = 'index.html'; // Redirect to login if not logged in
            return; // Stop further execution on this page
        }

        const teacher = MOCK_TEACHERS[loggedInRegNo];
        document.getElementById('teacherName').textContent = teacher.name;
        document.getElementById('aboutTeacher').textContent = teacher.about;

        // Menu button navigation
        const menuButtons = document.querySelectorAll('.menu-button');
        menuButtons.forEach(button => {
            button.addEventListener('click', () => {
                const page = button.getAttribute('data-page');
                window.location.href = page;
            });
        });

        // Logout button
        const logoutButton = document.getElementById('logoutButton');
        if(logoutButton) {
            logoutButton.addEventListener('click', () => {
                clearLoggedInTeacher();
                window.location.href = 'index.html';
            });
        }

        // Conceptual Alarm Notification (10 minutes before next class)
        const alarmNotificationSection = document.getElementById('alarmNotification');
        const alarmMessage = document.getElementById('alarmMessage');
        const alarmSound = document.getElementById('alarmSound');
        const alarmBusyButton = document.getElementById('alarmBusyButton');
        const alarmDismissButton = document.getElementById('alarmDismissButton');

        function checkUpcomingClasses() {
            const now = new Date();
            // This is highly simplified. Real scheduling logic is complex.
            // For demo, let's assume the first class in their timetable is "upcoming"
            // if it's within a certain window from now for demonstration.
            if (teacher.timetable && teacher.timetable.length > 0) {
                const nextClass = teacher.timetable.find(cls => {
                    // Simple check: assumes classes are on "today" for demo.
                    // Real logic needs to parse cls.day and cls.time against current date & time.
                    const classTimeParts = cls.time.match(/(\d{2}):(\d{2})\s*(AM|PM)/);
                    if (classTimeParts) {
                        let hours = parseInt(classTimeParts[1]);
                        const minutes = parseInt(classTimeParts[2]);
                        const ampm = classTimeParts[3];

                        if (ampm === "PM" && hours < 12) hours += 12;
                        if (ampm === "AM" && hours === 12) hours = 0; // Midnight

                        const classDateTime = new Date(now);
                        classDateTime.setHours(hours, minutes, 0, 0);

                        const diffMillis = classDateTime.getTime() - now.getTime();
                        const diffMinutes = diffMillis / (1000 * 60);

                        // Notify if class is between 0 and 15 minutes from now (adjust as needed)
                        return diffMinutes > 0 && diffMinutes <= 15;
                    }
                    return false;
                });


                if (nextClass) {
                    alarmMessage.textContent = `Your class for ${nextClass.subject} in ${nextClass.class} (${nextClass.room}) is in approximately 10 minutes.`;
                    alarmNotificationSection.style.display = 'block';
                    if(alarmSound) alarmSound.play().catch(e => console.log("Audio play prevented:", e)); // Autoplay might be blocked

                    alarmBusyButton.onclick = () => {
                        alarmNotificationSection.style.display = 'none';
                        alert(`Notification: You've marked yourself busy for ${nextClass.subject}. The system will attempt to arrange a substitute (conceptual).`);
                        // In a real app, trigger substitute logic here
                        // For now, redirect or show substitute info
                        window.location.href = `substitute.html?class=${encodeURIComponent(nextClass.subject)}&time=${encodeURIComponent(nextClass.time)}`;
                    };

                    alarmDismissButton.onclick = () => {
                        alarmNotificationSection.style.display = 'none';
                        if(alarmSound) alarmSound.pause();
                    };
                } else {
                     alarmNotificationSection.style.display = 'none';
                }
            }
        }
        // Check for classes periodically (e.g., every minute) or on page load
        checkUpcomingClasses();
        setInterval(checkUpcomingClasses, 60000); // Check every minute
    }

    // --- Timetable Page Logic (`timetable.html`) ---
    const timetableContainer = document.getElementById('timetableContainer');
    if (timetableContainer) {
        const loggedInRegNo = getLoggedInTeacher();
        if (loggedInRegNo && MOCK_TEACHERS[loggedInRegNo]) {
            const teacher = MOCK_TEACHERS[loggedInRegNo];
            let timetableHTML = '<h2>My Schedule</h2>';
            const days = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"]; // Add Sunday if needed
            days.forEach(day => {
                const classesToday = teacher.timetable.filter(cls => cls.day === day);
                if (classesToday.length > 0) {
                    timetableHTML += `<h3>${day}</h3><ul>`;
                    classesToday.forEach(cls => {
                        timetableHTML += `<li>${cls.time}: ${cls.subject} - ${cls.class} (Room: ${cls.room || 'N/A'})</li>`;
                    });
                    timetableHTML += `</ul>`;
                }
            });
            if (teacher.timetable.length === 0) {
                timetableHTML += "<p>No classes scheduled in your timetable.</p>";
            }
            timetableContainer.innerHTML = timetableHTML;

            // Display all teachers' status (mock)
            const allTeachersTimetableDiv = document.getElementById('allTeachersTimetable');
            if (allTeachersTimetableDiv) {
                let allTeachersHTML = ``;
                MOCK_ALL_TEACHERS_INFO.forEach(t => {
                    allTeachersHTML += `<p><strong>${t.name}</strong> (${t.subject}): ${t.status}</p>`;
                });
                allTeachersTimetableDiv.innerHTML = allTeachersHTML;
            }
        } else {
            timetableContainer.innerHTML = "<p>Could not load timetable. Please log in again.</p>";
        }
    }

    // --- Attendance Page Logic (`attendance.html`) ---
    const myAttendanceDiv = document.getElementById('myAttendance');
    if (myAttendanceDiv) {
        const loggedInRegNo = getLoggedInTeacher();
        if (loggedInRegNo && MOCK_TEACHERS[loggedInRegNo]) {
            const teacher = MOCK_TEACHERS[loggedInRegNo];
            let attendanceHTML = '';
            teacher.attendance.forEach(att => {
                attendanceHTML += `<p>${att.date}: ${att.status} ${att.reason ? `(${att.reason})` : ''} ${att.note ? `- ${att.note}` : ''}</p>`;
            });
            if(teacher.attendance.length === 0) attendanceHTML = "<p>No attendance records found.</p>";
            myAttendanceDiv.innerHTML = attendanceHTML;

            // Display overall college attendance (mock)
            const collegeAttendanceDiv = document.getElementById('collegeAttendance');
            if (collegeAttendanceDiv) {
                let collegeAttHTML = ``;
                MOCK_ALL_TEACHERS_INFO.forEach(t => { // Using MOCK_ALL_TEACHERS_INFO for status demo
                    collegeAttHTML += `<p><strong>${t.name}</strong>: ${t.status === 'On Leave' || t.status.toLowerCase().includes('absent') ? 'Absent' : (t.status.toLowerCase().includes('invigilation') ? 'Present (Invigilation)' : 'Present')}</p>`;
                });
                collegeAttendanceDiv.innerHTML = collegeAttHTML;
            }
        } else {
            myAttendanceDiv.innerHTML = "<p>Could not load attendance. Please log in again.</p>";
        }
    }

    // --- Substitute Arrangement Page Logic (`substitute.html`) ---
    const substituteArrangementDiv = document.getElementById('substituteArrangement');
    if (substituteArrangementDiv) {
        const loggedInRegNo = getLoggedInTeacher();
        const substituteInfoDiv = document.getElementById('substituteInfo');
        const requestSubstituteButton = document.getElementById('requestSubstituteButton');
        const myStatusSelect = document.getElementById('myStatus');

        // Check for class details from URL (passed from alarm)
        const urlParams = new URLSearchParams(window.location.search);
        const classSubjectFromAlarm = urlParams.get('class');
        const classTimeFromAlarm = urlParams.get('time');

        if (classSubjectFromAlarm && classTimeFromAlarm) {
            document.querySelector('#substituteArrangement h3').textContent = `Regarding Class: ${classSubjectFromAlarm} at ${classTimeFromAlarm}`;
            myStatusSelect.value = "busy_invigilation"; // Pre-select if coming from alarm's "busy"
        }


        if (loggedInRegNo && MOCK_TEACHERS[loggedInRegNo]) {
            const teacher = MOCK_TEACHERS[loggedInRegNo];

            requestSubstituteButton.addEventListener('click', () => {
                const status = myStatusSelect.value;
                let message = "";

                if (status === "available") {
                    message = "Status: You are marked as available. No substitute needed.";
                } else {
                    // Conceptual: Find a substitute for the teacher's subject(s)
                    // This needs a more robust logic for matching actual class subject
                    const subjectToCover = classSubjectFromAlarm || (teacher.timetable.length > 0 ? teacher.timetable[0].subject : "Unknown Subject"); // Fallback
                    const availableSubstitutes = MOCK_SUBSTITUTES[subjectToCover] || MOCK_SUBSTITUTES["General Science"] || ["No specific subject substitute found."];
                    const assignedSubstitute = availableSubstitutes[Math.floor(Math.random() * availableSubstitutes.length)]; // Randomly pick one

                    message = `Status: You are marked as '${status}'. For <strong>${subjectToCover}</strong>, <strong>${assignedSubstitute}</strong> has been conceptually assigned/notified.`;
                    if (status === "absent") {
                        message += " Please also ensure official leave application is submitted.";
                    }
                }
                substituteInfoDiv.innerHTML = `<p>${message}</p>`;
            });

        } else {
            substituteArrangementDiv.innerHTML = "<p>Could not load substitute system. Please log in again.</p>";
        }
    }


    // --- Salary Page Logic (`salary.html`) ---
    const salaryDetailsDiv = document.getElementById('salaryDetails');
    if (salaryDetailsDiv) {
        const loggedInRegNo = getLoggedInTeacher();
        if (loggedInRegNo && MOCK_TEACHERS[loggedInRegNo] && MOCK_TEACHERS[loggedInRegNo].salary) {
            const salaryData = MOCK_TEACHERS[loggedInRegNo].salary;
            let totalSalary = salaryData.base;

            document.getElementById('baseSalary').textContent = salaryData.base.toLocaleString();
            document.getElementById('yearsExperience').textContent = salaryData.experienceYears;
            document.getElementById('teacherDegree').textContent = salaryData.degree;
            document.getElementById('teacherSkills').textContent = salaryData.skills.join(', ');
            document.getElementById('studentReviewAvg').textContent = salaryData.studentReviewAvg;

            // Conceptual bonus calculations
            const experienceBonus = salaryData.experienceYears * 1000; // e.g., 1000 per year
            totalSalary += experienceBonus;
            document.getElementById('experienceBonus').textContent = experienceBonus.toLocaleString();

            let degreeAllowance = 0;
            if (salaryData.degree === "PhD") degreeAllowance = 8000;
            else if (salaryData.degree === "M.Sc." || salaryData.degree === "Masters") degreeAllowance = 5000;
            else degreeAllowance = 2000;
            totalSalary += degreeAllowance;
            document.getElementById('degreeAllowance').textContent = degreeAllowance.toLocaleString();

            const skillsPremium = salaryData.skills.length * 500; // e.g., 500 per listed skill
            totalSalary += skillsPremium;
            document.getElementById('skillsPremium').textContent = skillsPremium.toLocaleString();

            const reviewImpact = (salaryData.studentReviewAvg - 3.0) * 1000; // e.g., bonus/penalty based on deviation from 3.0
            totalSalary += reviewImpact;
            document.getElementById('reviewImpact').textContent = reviewImpact.toLocaleString();


            document.getElementById('totalSalary').textContent = totalSalary.toLocaleString();

        } else {
            salaryDetailsDiv.innerHTML = "<p>Could not load salary details. Please log in again.</p>"
        }
    }

});