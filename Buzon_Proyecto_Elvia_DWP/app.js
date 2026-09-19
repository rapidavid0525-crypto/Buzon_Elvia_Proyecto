// BANCO DE DATOS TEMPORALES (Almacenamiento Local Ficticio)
const INITIAL_USERS = [
    { nombre: "Daniel Castro", email: "daniel@utn.edu.mx", password: "123" }
];

const INITIAL_PROBLEMATICAS = [
    {
        id: 1,
        titulo: "Falta de proyectores en Aulas de Sistemas",
        tipo: "Queja",
        categoria: "Infraestructura",
        descripcion: "Los proyectores del edificio B presentan fallas continuas en las proyecciones.",
        usuario: "daniel@utn.edu.mx"
    },
    {
        id: 2,
        titulo: "Propuesta de área de estudio al aire libre",
        tipo: "Idea",
        categoria: "Servicios",
        descripcion: "Instalar mesas con conexiones eléctricas cerca de la explanada principal.",
        usuario: "contacto@utn.edu.mx"
    }
];

// INICIALIZACIÓN DE LOCALSTORAGE
if (!localStorage.getItem('utn_users')) {
    localStorage.setItem('utn_users', JSON.stringify(INITIAL_USERS));
}
if (!localStorage.getItem('utn_problematicas')) {
    localStorage.setItem('utn_problematicas', JSON.stringify(INITIAL_PROBLEMATICAS));
}

// CONTROLADOR DE NAVEGACIÓN Y RUTAS (SPA)
function navigateTo(sectionId) {
    const sections = document.querySelectorAll('.page-section');
    let targetFound = false;

    sections.forEach(section => {
        if (section.id === `sec-${sectionId}`) {
            section.classList.add('active');
            targetFound = true;
        } else {
            section.classList.remove('active');
        }
    });

    // Si la sección no existe, mostrar la página de error 404
    if (!targetFound) {
        document.getElementById('sec-404').classList.add('active');
    }

    // Renderizar datos dinámicos si se ingresa a la lista
    if (sectionId === 'problematicas') {
        renderProblematicas();
    }
}

// BÚSQUEDA INTERNA GLOBAL
function handleSearch(event) {
    if (event.key === 'Enter') {
        const query = event.target.value.toLowerCase().trim();
        if (!query) return;

        // Rutas directas soportadas
        const validRoutes = ['inicio', 'buzon', 'problematicas', 'informacion', 'contacto', 'ayuda', 'mapa', 'login', 'registro'];
        
        if (validRoutes.includes(query)) {
            navigateTo(query);
        } else {
            // Si la búsqueda no coincide exactamente con una sección, va a problemáticas y filtra o redirige a 404
            navigateTo('problematicas');
            renderProblematicas(query);
        }
    }
}

// VALIDACIÓN DE DATOS - AUTENTICACIÓN TEMPORAL

// Registro
function handleRegister(e) {
    e.preventDefault();
    const nombre = document.getElementById('reg-nombre').value;
    const email = document.getElementById('reg-email').value;
    const password = document.getElementById('reg-password').value;

    const users = JSON.parse(localStorage.getItem('utn_users'));

    if (users.find(u => u.email === email)) {
        alert("El correo electrónico ya se encuentra registrado.");
        return;
    }

    users.push({ nombre, email, password });
    localStorage.setItem('utn_users', JSON.stringify(users));

    alert("¡Registro exitoso! Ya puedes iniciar sesión.");
    document.getElementById('form-registro').reset();
    navigateTo('login');
}

// Iniciar Sesión
function handleLogin(e) {
    e.preventDefault();
    const email = document.getElementById('login-email').value;
    const password = document.getElementById('login-password').value;

    const users = JSON.parse(localStorage.getItem('utn_users'));
    const user = users.find(u => u.email === email && u.password === password);

    if (user) {
        localStorage.setItem('utn_session', JSON.stringify(user));
        updateAuthUI();
        alert(`¡Bienvenido/a, ${user.nombre}!`);
        document.getElementById('form-login').reset();
        navigateTo('inicio');
    } else {
        alert("Credenciales incorrectas. Verifica tu correo y contraseña.");
    }
}

// Recuperar Contraseña
function handleRecuperar(e) {
    e.preventDefault();
    const email = document.getElementById('rec-email').value;
    const users = JSON.parse(localStorage.getItem('utn_users'));
    const user = users.find(u => u.email === email);

    if (user) {
        alert(`Se han enviado las instrucciones de recuperación al correo: ${email}`);
        navigateTo('login');
    } else {
        alert("El correo proporcionado no se encuentra registrado.");
    }
}

// Cerrar Sesión
function logout() {
    localStorage.removeItem('utn_session');
    updateAuthUI();
    alert("Has cerrado sesión.");
    navigateTo('inicio');
}

// Actualizar barra según sesión activa
function updateAuthUI() {
    const session = JSON.parse(localStorage.getItem('utn_session'));
    const authButtons = document.getElementById('auth-buttons');
    const userProfile = document.getElementById('user-profile');
    const userDisplay = document.getElementById('user-display');

    if (session) {
        authButtons.classList.add('hidden');
        userProfile.classList.remove('hidden');
        userDisplay.textContent = session.nombre;
    } else {
        authButtons.classList.remove('hidden');
        userProfile.classList.add('hidden');
    }
}

// REGISTRO Y CONSULTA DE PROBLEMÁTICAS

function guardarProblematica(e) {
    e.preventDefault();
    const session = JSON.parse(localStorage.getItem('utn_session'));

    if (!session) {
        alert("Debes iniciar sesión para registrar una problemática.");
        navigateTo('login');
        return;
    }

    const titulo = document.getElementById('p-titulo').value;
    const tipo = document.getElementById('p-tipo').value;
    const categoria = document.getElementById('p-categoria').value;
    const descripcion = document.getElementById('p-descripcion').value;

    const problematicas = JSON.parse(localStorage.getItem('utn_problematicas'));
    
    const nuevaProblematica = {
        id: Date.now(),
        titulo,
        tipo,
        categoria,
        descripcion,
        usuario: session.email
    };

    problematicas.push(nuevaProblematica);
    localStorage.setItem('utn_problematicas', JSON.stringify(problematicas));

    alert("Problemática registrada con éxito.");
    document.getElementById('form-problemática').reset();
    navigateTo('problematicas');
}

function renderProblematicas(searchFilter = '') {
    const container = document.getElementById('lista-problematicas');
    const categoriaFiltro = document.getElementById('filter-categoria').value;
    const problematicas = JSON.parse(localStorage.getItem('utn_problematicas')) || [];

    container.innerHTML = '';

    const filtradas = problematicas.filter(p => {
        const coincideCat = categoriaFiltro === 'TODAS' || p.categoria === categoriaFiltro;
        const coincideSearch = p.titulo.toLowerCase().includes(searchFilter.toLowerCase()) || 
                               p.descripcion.toLowerCase().includes(searchFilter.toLowerCase());
        return coincideCat && coincideSearch;
    });

    if (filtradas.length === 0) {
        container.innerHTML = '<p>No se encontraron publicaciones asociadas.</p>';
        return;
    }

    filtradas.forEach(p => {
        const card = document.createElement('div');
        card.className = 'card';
        card.innerHTML = `
            <span class="badge">${p.tipo} - ${p.categoria}</span>
            <h3>${p.titulo}</h3>
            <p>${p.descripcion}</p>
            <small style="color: #777; margin-top: 10px; display: block;">Reportado por: ${p.usuario}</small>
        `;
        container.appendChild(card);
    });
}

// FUNCIONALIDAD DEL CHAT
function toggleChat() {
    const chatWidget = document.getElementById('chat-widget');
    const icon = document.getElementById('chat-toggle-icon');
    chatWidget.classList.toggle('chat-collapsed');
    icon.textContent = chatWidget.classList.contains('chat-collapsed') ? '▲' : '▼';
}

function sendChatMessage() {
    const input = document.getElementById('chat-input');
    const body = document.getElementById('chat-body');
    const text = input.value.trim();

    if (!text) return;

    // Mensaje Usuario
    const userMsg = document.createElement('div');
    userMsg.className = 'chat-msg user';
    userMsg.textContent = text;
    body.appendChild(userMsg);

    input.value = '';
    body.scrollTop = body.scrollHeight;

    // Respuesta Bot
    setTimeout(() => {
        const botMsg = document.createElement('div');
        botMsg.className = 'chat-msg bot';
        botMsg.textContent = "Gracias por comunicarte. Un asesor dará seguimiento a tu consulta en el Buzón Virtual.";
        body.appendChild(botMsg);
        body.scrollTop = body.scrollHeight;
    }, 800);
}

// INICIALIZACIÓN
window.addEventListener('DOMContentLoaded', () => {
    updateAuthUI();
    // Manejar fragmentos hash de la URL si existen o cargar inicio
    const hash = window.location.hash.replace('#', '');
    navigateTo(hash || 'inicio');
});