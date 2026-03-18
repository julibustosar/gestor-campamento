// Gestión de almacenamiento local.
let miGrupo = []; // Almacena el estado actual de los personajes en memoria

/**
 * Inicializa la aplicación recuperando datos persistentes del navegador.
 * Evita la pérdida de información tras recargar la página.
 */
function cargarPartida() {
    const datosGuardados = localStorage.getItem('campamento_bg3');
    if (datosGuardados) {
        miGrupo = JSON.parse(datosGuardados);
        // Renderiza el grupo inicial sin animaciones para optimizar la carga
        miGrupo.forEach(personaje => dibujarTarjeta(personaje, false));
    }
}

// Manipulación del DOM
/**
 * Crea e inyecta dinámicamente el HTML de un personaje en la cuadrícula.
 * @param {Object} personaje - Datos del personaje a renderizar.
 * @param {boolean} animar - Determina si se aplica efecto visual al entrar.
 */
function dibujarTarjeta(personaje, animar = true) {
    const tarjetaHTML = `
        <div class="tarjeta-personaje" data-id="${personaje.id}">
            <h3>${personaje.nombre}</h3>
            <p><strong>Raza:</strong> ${personaje.raza}</p>
            <p><strong>Clase:</strong> ${personaje.clase}</p>
            <button class="btn-eliminar">Despedir</button>
        </div>
    `;

    if (animar) {
        // Renderizado fluido de jQuery para mejorar la UX
        $(tarjetaHTML).hide().appendTo('#lista-personajes').fadeIn(800);
    } else {
        $('#lista-personajes').append(tarjetaHTML);
    }
}

// Eventos de entrada de datos al "reclutar"
$('#formulario-personaje').on('submit', function(evento) {
    evento.preventDefault(); // Intercepta el envío natural propio de HTML para manejarlo en el JS

    const nuevoPersonaje = {
        id: Date.now(), // Identificador único basado en timestamp
        nombre: $('#nombre').val(),
        raza: $('#raza').val(),
        clase: $('#clase').val()
    };

    // Actualiza el estado global y sincroniza con el LocalStorage
    miGrupo.push(nuevoPersonaje);
    localStorage.setItem('campamento_bg3', JSON.stringify(miGrupo));
    
    dibujarTarjeta(nuevoPersonaje, true);
    this.reset(); // Limpia los campos tras un registro exitoso
});

//Eventos de eliminación de datos al "despedir"
// Se aplica delegación de eventos al contenedor padre, ya que los botones son dinámicos
$('#lista-personajes').on('click', '.btn-eliminar', function() {
    
    // Capa de seguridad BOM para evitar borrados accidentales
    const confirmacion = window.confirm("¿Estás seguro de que quieres expulsar a este aventurero de tu campamento?");
    
    if (confirmacion) {
        const tarjeta = $(this).parent();
        const idEliminar = String(tarjeta.attr('data-id'));

        // Secuencia asíncrona: primero la animación, luego la destrucción del nodo
        tarjeta.fadeOut(600, function() {
            $(this).remove(); 
        });

        // Actualiza el estado global descartando el elemento eliminado y guarda cambios
        miGrupo = miGrupo.filter(personaje => String(personaje.id) !== idEliminar);
        localStorage.setItem('campamento_bg3', JSON.stringify(miGrupo));
    }
});

// Carga de datos JSON externos a Compendio
const btnCargarCompendio = document.getElementById('btn-cargar-compendio');
const listaCompendio = document.getElementById('lista-compendio');
let compendioCargado = false; // Bandera de control para evitar múltiples peticiones y redundancia

btnCargarCompendio.addEventListener('click', function() {
    
    // Sistema de interruptor si los datos ya fueron descargados
    if (compendioCargado) {
        $('#lista-compendio').slideToggle(500);
        return; 
    }

    listaCompendio.innerHTML = '<p>Buscando en los tomos antiguos...</p>';

    // Petición asincrónica a fuente de datos JSON estática
    fetch('compendio.json')
        .then(respuesta => {
            if (!respuesta.ok) throw new Error('Error de red al consultar el compendio.');
            return respuesta.json();
        })
        .then(datos => {
            listaCompendio.innerHTML = ''; 
            
            // Iteración de la respuesta y renderizado en DOM
            datos.forEach(item => {
                const itemHTML = `
                    <div class="tarjeta-personaje">
                        <h3>${item.nombre}</h3>
                        <p><strong>Tipo:</strong> ${item.tipo}</p>
                        <p><strong>Rareza:</strong> ${item.rareza}</p>
                        <p><em>"${item.descripcion}"</em></p>
                    </div>
                `;
                listaCompendio.insertAdjacentHTML('beforeend', itemHTML);
            });
            
            compendioCargado = true;
            btnCargarCompendio.textContent = "Ocultar / Mostrar Compendio";
        })
        .catch(error => {
            // Manejo de excepciones amigable para el usuario porque va con la temática de la página.
            listaCompendio.innerHTML = `<p style="color: red;">La magia ha fallado: ${error.message}</p>`;
        });
});

// Ejecución del ciclo de vida inicial de la app
cargarPartida();