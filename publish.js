console.log("Publish listo!");

const imagesInput = document.getElementById('images');
const previewContainer = document.getElementById('preview-container');
const submitBtn = document.getElementById('submit-post');

const rubroInput = document.getElementById('rubro');
const provinciaInput = document.getElementById('provincia');
const precioInput = document.getElementById('precio');
const precioInfo = document.getElementById('precio-info');

let selectedImages = [];
let selectedDates = [];

// Usuario logueado
const usuarioActual = localStorage.getItem('usuario_actual') || 'DemoUsuario';

/* ================== PREVIEWS ================== */

function renderPreviews() {
    previewContainer.innerHTML = "";
    selectedImages.forEach((file, index) => {
        const div = document.createElement('div');
        div.classList.add('preview-image');

        const img = document.createElement('img');
        img.src = file.base64 || URL.createObjectURL(file);
        if(!file.base64) img.onload = () => URL.revokeObjectURL(img.src);

        const btn = document.createElement('button');
        btn.textContent = "×";
        btn.addEventListener('click', () => {
            selectedImages.splice(index, 1);
            renderPreviews();
        });

        div.appendChild(img);
        div.appendChild(btn);
        previewContainer.appendChild(div);
    });
}

/* ================== COMPRESIÓN ================== */

function compressImage(file, maxWidth = 800, quality = 0.6) {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = event => {
            const img = new Image();
            img.onload = () => {
                const canvas = document.createElement('canvas');
                const scale = Math.min(maxWidth / img.width, 1);
                canvas.width = img.width * scale;
                canvas.height = img.height * scale;
                const ctx = canvas.getContext('2d');
                ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
                const compressedBase64 = canvas.toDataURL('image/jpeg', quality);
                resolve(compressedBase64);
            };
            img.onerror = () => reject(`No se pudo procesar la imagen: ${file.name}`);
            img.src = event.target.result;
        };
        reader.onerror = () => reject(`Error leyendo la imagen: ${file.name}`);
        reader.readAsDataURL(file);
    });
}

/* ================== IMÁGENES ================== */

imagesInput.addEventListener('change', e => {
    const files = Array.from(e.target.files);
    files.forEach(file => {
        if (selectedImages.length < 4) selectedImages.push(file);
    });
    renderPreviews();
});

/* ================== PRECIO ================== */

precioInput.addEventListener('input', () => {
    const valor = parseFloat(precioInput.value);
    if (!isNaN(valor)) {
        const neto = (valor * 0.92).toFixed(2);
        precioInfo.textContent = `Usted recibiría aproximadamente $${neto} por día luego de cubrir los costos de administración y obligaciones fiscales de manera profesional.`;
    } else {
        precioInfo.textContent = "El valor que usted indique se ajustará automáticamente para cubrir los costos de administración, gestión y obligaciones fiscales de forma profesional y transparente.";
    }
});

/* ================== CALENDARIO ================== */

function formatDate(date) {
    return date.toISOString().split('T')[0];
}

const calendarBody = document.getElementById('calendar-body');
const monthYear = document.getElementById('month-year');
const prevMonthBtn = document.getElementById('prev-month');
const nextMonthBtn = document.getElementById('next-month');

let today = new Date();
let currentMonth = today.getMonth();
let currentYear = today.getFullYear();

const months = ["Enero","Febrero","Marzo","Abril","Mayo","Junio","Julio","Agosto","Septiembre","Octubre","Noviembre","Diciembre"];

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
                    cell.style.backgroundColor = "#28a745";
                    cell.style.color = "#fff";
                }

                cell.addEventListener('click', () => {
                    const index = selectedDates.indexOf(formatted);
                    if(index > -1){
                        selectedDates.splice(index, 1);
                        cell.style.backgroundColor = "";
                        cell.style.color = "";
                    } else {
                        selectedDates.push(formatted);
                        cell.style.backgroundColor = "#28a745";
                        cell.style.color = "#fff";
                    }
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
    renderCalendar(currentMonth,currentYear);
});

nextMonthBtn.addEventListener('click', () => {
    currentMonth++;
    if(currentMonth>11){ currentMonth=0; currentYear++; }
    renderCalendar(currentMonth,currentYear);
});

renderCalendar(currentMonth,currentYear);

/* ================== PUBLICAR ================== */

submitBtn.addEventListener('click', async () => {

    const title = document.getElementById('title').value.trim();
    const rubro = rubroInput.value;
    const provincia = provinciaInput.value;
    const precio = parseFloat(precioInput.value) || 0;
    const descripcion = document.getElementById('descripcion').value.trim();
    const direccion = document.getElementById('direccion').value.trim();
    const telefono = document.getElementById('telefono').value.trim();
    const ciudad = document.getElementById('ciudad').value.trim();
    const garantia = parseFloat(document.getElementById('garantia').value) || 0;

    // 🔹 Tomamos los inputs DIRECTAMENTE al momento del click
    const horaDesdeInput = document.getElementById('hora-desde');
    const horaHastaInput = document.getElementById('hora-hasta');

    const horaDesde = horaDesdeInput ? horaDesdeInput.value : "";
    const horaHasta = horaHastaInput ? horaHastaInput.value : "";

    if(!title) return alert("Por favor ingresa un título");
    if(selectedImages.length === 0) return alert("Por favor sube al menos una foto");
    if(selectedDates.length === 0) return alert("Debe seleccionar al menos un día de disponibilidad");

    try {

        const compressedPromises = selectedImages.map(file => {
            if(file.base64) return file.base64;
            return compressImage(file);
        });

        const imagesBase64 = await Promise.all(compressedPromises);
        const posts = JSON.parse(localStorage.getItem('localiar_posts') || '[]');

        let horario = null;

        if(horaDesde && horaHasta){
            horario = {
                desde: horaDesde,
                hasta: horaHasta
            };
        }

        posts.push({
            title,
            images: imagesBase64,
            rubro,
            provincia,
            precio,
            ciudad,
            descripcion,
            direccion,
            telefono,
            garantia,
            disponibilidad: selectedDates,
            horario: horario,
            usuario: usuarioActual,
            reservas: []
        });

        localStorage.setItem('localiar_posts', JSON.stringify(posts));
        alert("Publicación creada con éxito");
        window.location.href = 'index.html';

    } catch (err) {
        console.error(err);
        alert("Ocurrió un error al procesar las imágenes. Usa JPG/PNG.");
    }
});