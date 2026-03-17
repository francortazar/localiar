const loginBtn = document.getElementById('login-btn');
const registerLink = document.getElementById('register-link');
const acceptTerms = document.getElementById('accept-terms');
const formTitle = document.getElementById('form-title');
const extraFields = document.getElementById('register-extra-fields');

let modoRegistro = false;

// BOTÓN PRINCIPAL (LOGIN o REGISTRO)
loginBtn.addEventListener('click', () => {

    const email = document.getElementById('email').value.trim();
    const password = document.getElementById('password').value;
    const username = document.getElementById('username')?.value.trim();
    const birthdate = document.getElementById('birthdate')?.value;

    if(!email || !password){
        alert("Completa todos los campos obligatorios");
        return;
    }

    if(!acceptTerms.checked){
        alert("Debes aceptar los términos y condiciones");
        return;
    }

    const users = JSON.parse(localStorage.getItem('localiar_users') || '[]');

    // =========================
    // MODO REGISTRO
    // =========================
    if(modoRegistro){

        if(!username || !birthdate){
            alert("Completa todos los campos para registrarte");
            return;
        }

        if(users.some(u => u.email === email)){
            return alert("Este email ya está registrado");
        }

        if(users.some(u => u.username === username)){
            return alert("Este nombre de usuario ya está en uso");
        }

        const nuevoUsuario = {
            username,
            email,
            password,
            birthdate,
            valoracion: 5, // valoración inicial
            reservas: []
        };

        users.push(nuevoUsuario);
        localStorage.setItem('localiar_users', JSON.stringify(users));

        alert("Registro exitoso 🎉 Ahora puedes iniciar sesión");

        // Volver a modo login
        activarModoLogin();
        return;
    }

    // =========================
    // MODO LOGIN
    // =========================
    const user = users.find(u => u.email === email && u.password === password);

    if(user){
        localStorage.setItem('usuario_actual', user.username);
        alert("Login exitoso");
        window.location.href = 'index.html';
    } else {
        alert("Email o contraseña incorrectos");
    }

});


// BOTÓN CAMBIAR A REGISTRO
registerLink.addEventListener('click', () => {

    if(!modoRegistro){
        activarModoRegistro();
    } else {
        activarModoLogin();
    }

});


// =========================
// FUNCIONES
// =========================

function activarModoRegistro(){
    modoRegistro = true;
    formTitle.textContent = "Crear Cuenta";
    loginBtn.textContent = "Registrarme";
    registerLink.textContent = "¿Ya tienes cuenta? Inicia sesión";
    extraFields.style.display = "block";
}

function activarModoLogin(){
    modoRegistro = false;
    formTitle.textContent = "Iniciar Sesión";
    loginBtn.textContent = "Ingresar";
    registerLink.textContent = "¿No tienes cuenta? Regístrate";
    extraFields.style.display = "none";
}