const { EXTENSIONES_VALIDAS } = require('../utils/constantes');
const { v4: uuidv4 } = require('uuid');
const path = require('path');
const fs = require('fs');   // FileSystem permite leer las carpetas y los archivos

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
    file.mv(path, (error) => {
        if (error) {
            console.log(error);
            throw new Error("Ocurrio un error al momento de guardarse el archivo!");
        }
    });
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

module.exports = {
    uploadFile,
    deleteFile,
    getFile
}