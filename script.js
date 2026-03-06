
alert("INDEX NUEVO CARGADO");const cardsContainer = document.getElementById('cards-container');
const rubroFilter = document.getElementById('rubro-filter');
const provinciaFilter = document.getElementById('provincia-filter');
const searchInput = document.getElementById('search-input');
const searchBtn = document.getElementById('search-btn');

const calendarBody = document.getElementById('calendar-body');
const monthYear = document.getElementById('month-year');
const prevMonthBtn = document.getElementById('prev-month');
const nextMonthBtn = document.getElementById('next-month');

const months = [
  "Enero","Febrero","Marzo","Abril","Mayo","Junio",
  "Julio","Agosto","Septiembre","Octubre","Noviembre","Diciembre"
];

let today = new Date();
let currentMonth = today.getMonth();
let currentYear = today.getFullYear();
let selectedDates = JSON.parse(localStorage.getItem("filtro_fechas") || "[]");

const usuarioActual = localStorage.getItem('usuario_actual') || 'DemoUsuario';

function formatDate(date) {
    const y = date.getFullYear();
    const m = String(date.getMonth()+1).padStart(2,'0');
    const d = String(date.getDate()).padStart(2,'0');
    return `${y}-${m}-${d}`;
}

function renderCalendar(month, year){
    calendarBody.innerHTML = "";
    monthYear.textContent = `${months[month]} ${year}`;

    const firstDay = new Date(year, month, 1).getDay();
    const daysInMonth = new Date(year, month + 1, 0).getDate();

    let date = 1;
    for(let i=0;i<6;i++){
        const row = document.createElement('tr');

        for(let j=0;j<7;j++){
            const cell = document.createElement('td');
            if(i===0 && j<firstDay){
                cell.textContent = "";
            } else if(date>daysInMonth){
                cell.textContent = "";
            } else {
                cell.textContent = date;
                const cellDate = new Date(year, month, date);
                const formatted = formatDate(cellDate);

                if(selectedDates.includes(formatted)){
                    cell.classList.add('selected');
                }

                cell.addEventListener('click', ()=>{
                    const idx = selectedDates.indexOf(formatted);
                    if(idx>-1){
                        selectedDates.splice(idx,1);
                        cell.classList.remove('selected');
                    } else {
                        selectedDates.push(formatted);
                        cell.classList.add('selected');
                    }

                    localStorage.setItem("filtro_fechas", JSON.stringify(selectedDates));
                    loadPosts();
                });

                date++;
            }
            row.appendChild(cell);
        }
        calendarBody.appendChild(row);
    }
}

prevMonthBtn.addEventListener('click', ()=>{
    currentMonth--;
    if(currentMonth<0){ currentMonth=11; currentYear--; }
    renderCalendar(currentMonth,currentYear);
});

nextMonthBtn.addEventListener('click', ()=>{
    currentMonth++;
    if(currentMonth>11){ currentMonth=0; currentYear++; }
    renderCalendar(currentMonth,currentYear);
});

function loadPosts() {
    const posts = JSON.parse(localStorage.getItem("localiar_posts") || "[]");
    cardsContainer.innerHTML = "";

    const rubroValue = rubroFilter.value;
    const provinciaValue = provinciaFilter.value;
    const searchValue = searchInput.value.toLowerCase();

    posts.forEach((post, index)=>{

        if(rubroValue!=="todos" && post.rubro!==rubroValue) return;
        if(provinciaValue!=="todas" && post.provincia!==provinciaValue) return;
        if(searchValue && !post.title.toLowerCase().includes(searchValue)) return;

        if(selectedDates.length>0){
            if(post.disponibilidad && post.disponibilidad.length>0){
                const coincide = selectedDates.every(f => post.disponibilidad.includes(f));
                if(!coincide) return;
            }
        }

        const card = document.createElement('div');
        card.classList.add('card');

        const img = document.createElement('img');
        img.src = post.images && post.images.length ? post.images[0] : "";
        img.alt = post.title;

        const h4 = document.createElement('h4');
        h4.textContent = post.title;

        const rubroP = document.createElement('p');
        rubroP.innerHTML = `<strong>Rubro:</strong> ${post.rubro || 'No especificado'}`;

        const provP = document.createElement('p');
        provP.innerHTML = `<strong>Provincia:</strong> ${post.provincia || 'No especificada'}`;

        const precioP = document.createElement('p');
        precioP.innerHTML = `<strong>Precio por día:</strong> $${post.precio || '0'} <span style="font-size:0.9em;color:#555;">+ impuestos</span>`;

        const horarioP = document.createElement('p');

let desde = null;
let hasta = null;

if(post.horario){
    if(typeof post.horario === "object"){
        desde = post.horario.desde;
        hasta = post.horario.hasta;
    } else if(typeof post.horario === "string"){
        const partes = post.horario.split("-");
        if(partes.length === 2){
            desde = partes[0].trim();
            hasta = partes[1].trim();
        }
    }
}

if(post.horarioDesde && post.horarioHasta){
    desde = post.horarioDesde;
    hasta = post.horarioHasta;
}

if(desde && hasta){
    horarioP.innerHTML = `<strong>Horario:</strong> ${desde} - ${hasta}`;
} else {
    horarioP.innerHTML = "";
}

        const btnContainer = document.createElement('div');
        btnContainer.style.marginTop = '10px';
        btnContainer.style.display = 'flex';
        btnContainer.style.justifyContent = 'center';

        if(post.usuario === usuarioActual){
            const delBtn = document.createElement('button');
            delBtn.textContent = 'Eliminar';
            delBtn.style.backgroundColor = '#ff4d4f';
            delBtn.style.color = '#fff';
            delBtn.style.border = 'none';
            delBtn.style.padding = '6px 12px';
            delBtn.style.borderRadius = '4px';
            delBtn.style.cursor = 'pointer';
            delBtn.addEventListener('click',(e)=>{
                e.stopPropagation();
                if(confirm('¿Desea eliminar esta publicación?')){
                    posts.splice(index,1);
                    localStorage.setItem('localiar_posts', JSON.stringify(posts));
                    loadPosts();
                }
            });
            btnContainer.appendChild(delBtn);
        }

        card.addEventListener('click', ()=>{
            localStorage.setItem('ver_post', JSON.stringify(post));
            window.location.href='publicacion.html';
        });

        card.appendChild(img);
        card.appendChild(h4);
        card.appendChild(rubroP);
        card.appendChild(provP);
        card.appendChild(precioP);
        card.appendChild(horarioP);
        card.appendChild(btnContainer);

        cardsContainer.appendChild(card);
    });
}

rubroFilter.addEventListener('change', loadPosts);
provinciaFilter.addEventListener('change', loadPosts);
searchBtn.addEventListener('click', loadPosts);
searchInput.addEventListener('keyup',(e)=>{
    if(e.key==='Enter') loadPosts();
});

renderCalendar(currentMonth,currentYear);
loadPosts();