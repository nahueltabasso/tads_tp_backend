/*
_________ _______  ______   _______       _______  _______  ______       _______  _______  _______ _________ _______  _
\__   __/(  ___  )(  __  \ (  ____ \     (  ____ )(  ____ \(  __  \     (  ____ \(  ___  )(  ____ \\__   __/(  ___  )( \
   ) (   | (   ) || (  \  )| (    \/     | (    )|| (    \/| (  \  )    | (    \/| (   ) || (    \/   ) (   | (   ) || (
   | |   | (___) || |   ) || (_____      | (____)|| (__    | |   ) |    | (_____ | |   | || |         | |   | (___) || |
   | |   |  ___  || |   | |(_____  )     |     __)|  __)   | |   | |    (_____  )| |   | || |         | |   |  ___  || |
   | |   | (   ) || |   ) |      ) |     | (\ (   | (      | |   ) |          ) || |   | || |         | |   | (   ) || |
   | |   | )   ( || (__/  )/\____) |     | ) \ \__| (____/\| (__/  )    /\____) || (___) || (____/\___) (___| )   ( || (____/\
   )_(   |/     \|(______/ \_______)_____|/   \__/(_______/(______/_____\_______)(_______)(_______/\_______/|/     \|(_______/
                                   (_____)                        (_____)
    ###################################################################################
    # Servicio para el manejo de archivos                                             #
    ###################################################################################

*/

const { EXTENSIONES_VALIDAS } = require('../utils/constantes');
const { v4: uuidv4 } = require('uuid');
const path = require('path');
const fs = require('fs');   // FileSystem permite leer las carpetas y los archivos
const sharp = require('sharp');

const uploadFile = async(file, tipo, registro) => {
    console.log('Archivo a procesar \n', file);
    // Procesar el archivo
    const nombreCortado = file.name.split('.');
    const extensionArchivo = nombreCortado[nombreCortado.length - 1];

    const extencionesValidas = EXTENSIONES_VALIDAS;
    if (!extencionesValidas.includes(extensionArchivo)) {
        return 'Extension no Valida';
    }

    // Generamos le nombre del archivo
    const nombreArchivo = `${uuidv4()}.${extensionArchivo}`;
    registro.srcImagen = nombreArchivo;
    console.log(registro.srcImagen);

    // Path para almacenar la imagen
    const path = `./uploads/${tipo}/${nombreArchivo}`;
    console.log(path);

    // Mover la imagen hacia el directorio
    await fileOptimizer(file.data, path, 500);
}

const uploadFiles = async(files, tipo, registro) => {
    console.log('Archivo a procesar \n', files);
    // Procesar el archivo
    let nombreArchivo;
    for (let i = 0; i < files.length; i++) {
        const nombreCortado = files[i].name.split('.');
        const extensionArchivo = nombreCortado[nombreCortado.length - 1];

        const extencionesValidas = EXTENSIONES_VALIDAS;
        if (!extencionesValidas.includes(extensionArchivo)) {
            return 'Extension no Valida';
        }

        // Generamos le nombre del archivo
        nombreArchivo = `${uuidv4()}.${extensionArchivo}`;
        registro.srcImagen.push(nombreArchivo);

        // Path para almacenar la imagen
        const path = `./uploads/${tipo}/${nombreArchivo}`;
        console.log(path);
        nombreArchivo = '';

        // Mover la imagen hacia el directorio
        await fileOptimizer(files[i].data, path, 500);
    }

    console.log(registro.srcImagen);
}

const deleteFile = (tipo, src) => {
    const path = `./uploads/${tipo}/${src}`;
    if (fs.existsSync(path)) {
        // Borramos el archivo anterior
        fs.unlinkSync(path);
    }
}

const getFile = (tipo, file) => {
    const pathFile = path.join(__dirname, `../uploads/${tipo}/${file}`);

    // Imagen por defecto en caso de ser del Perfil del Usuario
    if (!fs.existsSync(pathFile)) {
        const pathFileDefault = path.join(__dirname, '../uploads/no-img.jpg');
        return pathFileDefault;
    } else {
        // Implica que existe la imagen en el servidor
        return pathFile;
    }
}

const fileOptimizer = async(file, path, size = 300) => {
    try {
        await sharp(file)
            .resize({
                width: size
            })
            .toFile(path);
    } catch (error) {
        console.log(error);
    }
}

module.exports = {
    uploadFile,
    uploadFiles,
    deleteFile,
    getFile
}