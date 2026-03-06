const calendarBody = document.getElementById('calendar-body');
const monthYear = document.getElementById('month-year');
const prevMonthBtn = document.getElementById('prev-month');
const nextMonthBtn = document.getElementById('next-month');

let today = new Date();
let currentMonth = today.getMonth();
let currentYear = today.getFullYear();
let selectedDates = [];

const months = [
    "Enero", "Febrero", "Marzo", "Abril", "Mayo", "Junio",
    "Julio", "Agosto", "Septiembre", "Octubre", "Noviembre", "Diciembre"
];

function renderCalendar(month, year) {
    calendarBody.innerHTML = "";
    monthYear.textContent = `${months[month]} ${year}`;

    const firstDay = new Date(year, month, 1).getDay();
    const daysInMonth = new Date(year, month + 1, 0).getDate();

    let date = 1;
    for (let i = 0; i < 6; i++) {
        const row = document.createElement('tr');
        for (let j = 0; j < 7; j++) {
            const cell = document.createElement('td');
            if (i === 0 && j < firstDay) {
                cell.textContent = "";
            } else if (date > daysInMonth) {
                cell.textContent = "";
            } else {
                cell.textContent = date;
                const cellDate = new Date(year, month, date);
                if (selectedDates.some(d => d.getTime() === cellDate.getTime())) {
                    cell.classList.add('selected');
                }
                cell.addEventListener('click', () => {
                    const index = selectedDates.findIndex(d => d.getTime() === cellDate.getTime());
                    if (index > -1) {
                        selectedDates.splice(index, 1);
                        cell.classList.remove('selected');
                    } else {
                        selectedDates.push(cellDate);
                        cell.classList.add('selected');
                    }
                    console.log("Fechas seleccionadas:", selectedDates);
                });
                date++;
            }
            row.appendChild(cell);
        }
        calendarBody.appendChild(row);
    }
}

prevMonthBtn.addEventListener('click', () => {
    currentMonth--;
    if(currentMonth<0){ currentMonth=11; currentYear--; }
    renderCalendar(currentMonth, currentYear);
});

nextMonthBtn.addEventListener('click', () => {
    currentMonth++;
    if(currentMonth>11){ currentMonth=0; currentYear++; }
    renderCalendar(currentMonth, currentYear);
});

renderCalendar(currentMonth, currentYear);
