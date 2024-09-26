document.getElementById('register').addEventListener('submit', function (e) {
    e.preventDefault();
    alert('Registro exitoso!');
    showHomepage();
});

document.getElementById('login').addEventListener('submit', function (e) {
    e.preventDefault();
    const email = document.getElementById('login-email').value;
    const password = document.getElementById('login-password').value;

    axios.post('http://localhost:8080/auth/login', { email, password })
        .then(function (response) {
            const userId = response.data.id; // Suponiendo que el backend devuelve el ID del usuario
            localStorage.setItem('userId', userId); // Guardar el ID en localStorage
            alert('Inicio de sesión exitoso');
            showHomepage(); // Redirigir a la página principal
        })
        .catch(function (error) {
            console.error('Error en el inicio de sesión:', error);
            alert('Correo o contraseña incorrectos.');
        });
});

function showRegister() {
    document.getElementById('register-form').style.display = 'block';
    document.getElementById('login-form').style.display = 'none';
}
function showProductos() {
    hideAllSections();  // Ocultar todas las demás secciones
    const productosSection = document.getElementById('productos-section');
    
    if (!productosSection) {
        console.error('No se encontró el elemento con id productos-section.');
        return;
    }

    productosSection.style.display = 'block';  // Mostrar la sección de productos

    // Cargar productos al seleccionar la pestaña Productos
    fetchProductos();  // Llama a la función para obtener productos
}



function showLogin() {
    document.getElementById('register-form').style.display = 'none';
    document.getElementById('login-form').style.display = 'block';
}

function showProfile() {
    hideAllSections();  // Ocultar todas las demás secciones

    const userId = localStorage.getItem('userId');  // Obtener el ID del usuario almacenado
    if (!userId) {
        alert('Error: No se encontró el ID del usuario. Por favor inicia sesión.');
        return;
    }

    // Realizar la solicitud GET para obtener los datos del usuario
    axios.get(`http://localhost:8080/usuarios/${userId}`)
        .then(function (response) {
            const usuario = response.data;
            document.getElementById('edit-nombre').value = usuario.nombre;
            document.getElementById('edit-apellido').value = usuario.apellido;
            document.getElementById('edit-email').value = usuario.email;
            document.getElementById('edit-password').value = usuario.password;

            document.getElementById('profile').style.display = 'block';  // Mostrar la sección de perfil
        })
        .catch(function (error) {
            console.error('Error al cargar el perfil:', error);
            alert('Error al cargar los datos del perfil.');
        });
}




function showHomepage() {
    hideAllSections();  // Oculta todas las demás secciones
    document.getElementById('homepage').style.display = 'block';  // Muestra la página principal
}


function hideAllSections() {
    const authSection = document.getElementById('auth');
    const homepageSection = document.getElementById('homepage');
    const productDetailsSection = document.getElementById('product-details');
    const profileSection = document.getElementById('profile');

    if (authSection) authSection.style.display = 'none';
    if (homepageSection) homepageSection.style.display = 'none';
    if (productDetailsSection) productDetailsSection.style.display = 'none';
    if (profileSection) profileSection.style.display = 'none';
}

function fetchProductos() {
    axios.get('http://localhost:8080/productos')
    .then(function (response) {
        console.log('Productos recibidos:', response.data);  // Verifica que los productos se obtienen correctamente
        renderProductos(response.data);  // Renderiza los productos en la tabla
    })
    .catch(function (error) {
        console.error('Error al obtener los productos:', error);
    });
}

// Llama a la función fetchProductos cuando la página de productos se cargue
window.addEventListener('DOMContentLoaded', fetchProductos);

// Llama a la función fetchProductos cuando sea necesario



function showProductDetails(productId) {
    axios.get(`http://localhost:8080/productos/${productId}`)
        .then(function (response) {
            const producto = response.data;
            document.getElementById('product-img').src = producto.imagen_url;
            document.getElementById('product-info').innerHTML = `
                <h3>${producto.nombre}</h3>
                <p>${producto.descripcion}</p>
                <p>Precio: $${producto.precio}</p>
                <p>Stock: ${producto.stock}</p>
            `;
            document.getElementById('product-details').style.display = 'block';
        })
        .catch(function (error) {
            console.error('Error al obtener detalles del producto:', error);
            alert('Error al obtener detalles del producto.');
        });
}

function hideProductDetails() {
    document.getElementById('product-details').style.display = 'none';
    document.getElementById('homepage').style.display = 'block';
}

// Función para crear un pedido cuando se agrega un producto al carrito
function addToCart(button) {
    const usuarioId = localStorage.getItem('userId');  // Obtener el ID del usuario almacenado
    const productoId = button.getAttribute('data-id');  // Obtener el ID del producto

    if (!usuarioId) {
        alert('Inicia sesión para agregar productos al carrito');
        return;
    }

    axios.post(`http://localhost:8080/pedidos/usuario/${usuarioId}/producto/${productoId}`, {
        cantidad: 1  // Aquí puedes personalizar la cantidad
    })
    .then(function (response) {
        console.log('Pedido creado exitosamente:', response.data);
        alert('Producto añadido al carrito exitosamente!');
    })
    .catch(function (error) {
        console.error('Error al crear el pedido:', error);
        alert('Hubo un error al añadir el producto al carrito.');
    });
}

function logout() {
    alert('Has cerrado sesión!');
    localStorage.removeItem('userId'); // Elimina el ID de usuario almacenado
    document.getElementById('homepage').style.display = 'none';
    document.getElementById('auth').style.display = 'block';
}

// Función para listar productos
async function listarProductos() {
    try {
        const response = await axios.get('http://localhost:8080/productos');
        return response.data;  // Retorna la lista de productos
    } catch (error) {
        console.error('Error al obtener productos:', error);
        return [];
    }
}

// Función para mostrar productos
function renderProductos(productos) {
    const productTableBody = document.querySelector('#product-table tbody');
    productTableBody.innerHTML = '';  // Limpia la tabla antes de agregar productos

    productos.forEach(producto => {
        const row = document.createElement('tr');
        row.innerHTML = `
            <td>${producto.id}</td>
            <td>${producto.nombre}</td>
            <td>${producto.descripcion}</td>
            <td><img src="${producto.imagen_url}" alt="${producto.nombre}" width="100"></td>
            <td>${producto.precio}</td>
            <td>${producto.stock}</td>
            <td>
                <button class="carrito-btn" data-id="${producto.id}" onclick="addToCart(this)">Agregar al carrito</button>
                <button class="eliminar-btn" data-id="${producto.id}">Eliminar</button>
            </td>
        `;
        productTableBody.appendChild(row);
    });

    // Ahora puedes asignar eventos a los botones de detalles, eliminar o carrito si es necesario

    const eliminarButtons = document.querySelectorAll('.eliminar-btn');
    eliminarButtons.forEach(button => {
        button.addEventListener('click', function () {
            const productoId = this.getAttribute('data-id');
            eliminarProducto(productoId);
        });
    });

// Cargar productos al iniciar la aplicación
window.addEventListener('DOMContentLoaded', fetchProductos);

    // Asignar eventos a los botones de detalles
    const detallesButtons = document.querySelectorAll('.detalles-btn');
    detallesButtons.forEach(button => {
        button.addEventListener('click', function () {
            const productoId = this.getAttribute('data-id');
            showProductDetails(productoId);
        });
    });
}
// Cargar productos al iniciar la aplicación
window.addEventListener('DOMContentLoaded', async () => {
    const productos = await listarProductos();
    renderProductos(productos);
});

document.querySelector('a[href="#productos"]').addEventListener('click', showProductos);
window.addEventListener('DOMContentLoaded', () => {
    hideAllSections();  // Ocultar todas las secciones al inicio
});

window.addEventListener('DOMContentLoaded', function () {
    const registerForm = document.getElementById('register');
    if (registerForm) {
        registerForm.addEventListener('submit', function (e) {
            e.preventDefault();
            alert('Registro exitoso!');
            showHomepage();
        });
    }
});

// Función para eliminar un producto
async function eliminarProducto(id) {
    try {
        await axios.delete(`http://localhost:8080/productos/${id}`);
        alert('Producto eliminado exitosamente!');
        fetchProductos();  // Actualiza la lista de productos
    } catch (error) {
        console.error('Error al eliminar el producto:', error);
        alert('Hubo un error al eliminar el producto.');
    }
}

// Función para eliminar producto
// Asegúrate de que no haya dos funciones con el mismo nombre

// Función para crear un pedido cuando se agrega un producto al carrito
//function addToCart(productoId) {
//    const usuarioId = localStorage.getItem('userId'); // Obtener el ID del usuario actual
//    const cantidad = 1; // Por defecto, 1 producto en el carrito, puedes cambiarlo según la UI

//    axios.post(`http://localhost:8080/pedidos/usuario/${usuarioId}/producto/${productoId}`, {
//        cantidad: cantidad
//    })
//     .then(function (response) {
//         alert('Producto añadido al carrito!');
//         console.log('Pedido creado:', response.data);
//     })
//     .catch(function (error) {
//         console.error('Error al crear el pedido:', error);
//         alert('Hubo un error al añadir el producto al carrito.');
//     });
// }


// Asignar el evento click al botón de carrito en el HTML (ajusta según tu HTML)
document.getElementById('button_cart').addEventListener('click', function() {
    const productoId = /* id del producto actual */
    addToCart(productoId);
});
// Función para eliminar un usuario desde el frontend
// Función para eliminar usuario
// Función para eliminar usuario desde el frontend
function eliminarUsuario() {
    console.log('Intentando eliminar usuario...');  // Agregar mensaje de depuración

    const userId = localStorage.getItem('userId');
    if (!userId) {
        alert("No se encontró el ID del usuario. Por favor, inicia sesión nuevamente.");
        return;
    }

    const confirmacion = confirm("¿Estás seguro de que deseas eliminar tu cuenta? Esta acción no se puede deshacer.");
    
    if (confirmacion) {
        axios.delete(`http://localhost:8080/usuarios/${userId}`)
            .then(function () {
                alert("Cuenta eliminada exitosamente.");
                localStorage.removeItem('userId');
                window.location.href = "/";  // Redirigir a la página principal
            })
            .catch(function (error) {
                console.error("Error al eliminar la cuenta:", error);
                alert("Hubo un error al eliminar la cuenta.");
            });
    }
}


// Asignar la función al botón de eliminar cuenta
document.getElementById('delete-account-btn').addEventListener('click', eliminarUsuario);


document.addEventListener('DOMContentLoaded', function () {
    // Función para eliminar usuario desde el frontend
    function eliminarUsuario() {
        const userId = localStorage.getItem('userId');
        if (!userId) {
            console.error("Error: No se encontró el ID del usuario.");
            return;
        }
        // Eliminar usuario si userId existe

        const confirmacion = confirm("¿Estás seguro de que deseas eliminar tu cuenta? Esta acción no se puede deshacer.");
        
        if (confirmacion) {
            axios.delete(`http://localhost:8080/usuarios/${userId}`)
                .then(function () {
                    alert("Cuenta eliminada exitosamente.");
                    localStorage.removeItem('userId');
                    window.location.href = "/";  // Redirigir a la página principal
                })
                .catch(function (error) {
                    console.error("Error al eliminar la cuenta:", error);
                    alert("Hubo un error al eliminar la cuenta.");
                });
        }
    }

    // Asignar la función al botón de eliminar cuenta
    const deleteButton = document.getElementById('delete-account-btn');
    if (deleteButton) {
        deleteButton.addEventListener('click', eliminarUsuario);
    }
});

document.addEventListener('DOMContentLoaded', function () {
    const deleteButton = document.getElementById('delete-account-btn');
    
    if (deleteButton) {
        deleteButton.addEventListener('click', function() {
            console.log("Botón presionado. Intentando eliminar usuario...");  // Log para verificar
            eliminarUsuario();
        });
    }
});






