const getMenu = (role) => {
    let menu;
    if (role.nombreRol === 'ROLE_USER') {
        menu = [
            {
                titulo: 'Inicio',
                icono: 'nav-icon fas fa-home',
                url: '/',
                submenu: []
            },
            {
                titulo: 'Mi Pefil',
                icono: 'nav-icon fas fa-user-tag',
                url: 'mi-perfil',
                submenu: []
            },
            {
                titulo: 'Mis Amigos',
                icono: 'nav-icon fas fa-user-friends',
                url: 'mis-amigos',
                submenu: []
            }

        ];

    }

    return menu;
}

module.exports = {
    getMenu
}