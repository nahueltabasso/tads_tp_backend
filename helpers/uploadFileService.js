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
const cloudinary = require('cloudinary');

cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
});

const uploadFile = async(file, tipo, registro, size) => {
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
    await fileOptimizer(file.data, path, size);
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

const uploadFileToCDN = async(file, tipo, registro) => {
    console.log('Archivo a procesar \n', file);
    // Procesar el archivo
    const nombreCortado = file.name.split('.');
    const extensionArchivo = nombreCortado[nombreCortado.length - 1];

    const extencionesValidas = EXTENSIONES_VALIDAS;
    if (!extencionesValidas.includes(extensionArchivo)) {
        return 'Extension no Valida';
    }

    let result;
    // Almacenamos la imagen en cloudinary ----------------------------------------------
    /*
    result = await cloudinary.v2.uploader.upload(file.tempFilePath, {
        eager: [
            { width: 612, height: 612 },
            { width: 400, height: 400 }
        ]
    }, function (err, result) {
        console.log('Resultado de cloudinary', result);
        registro.publicIds.push(result.public_id);
        registro.srcImagenWeb.push(result.eager[0].secure_url);
        registro.srcImagenMobile.push(result.eager[1].secure_url);
    });
     */
    result = await uploadToCloudinary(file, registro);
    registro.srcImagen.push(result.secure_url);
}

const uploadMultipleFileToCDN = async(files, tipo, registro) => {
    console.log('Archivos a procesar \n', files);
    // Procesar el archivo
    for (let i = 0; i < files.length; i++) {
        const nombreCortado = files[i].name.split('.');
        const extensionArchivo = nombreCortado[nombreCortado.length - 1];

        const extencionesValidas = EXTENSIONES_VALIDAS;
        if (!extencionesValidas.includes(extensionArchivo)) {
            return 'Extension no Valida';
        }

        let result;
        // Almacenamos la imagen en cloudinary ----------------------------------------------
        /*
        result = await cloudinary.v2.uploader.upload(files[i].tempFilePath, {
            eager: [
                { width: 612, height: 612 },
                { width: 400, height: 400 }
            ]
        }, function (err, result) {
            console.log('Resultado de cloudinary', result);
            registro.publicIds.push(result.public_id);
            registro.srcImagenWeb.push(result.eager[0].secure_url);
            registro.srcImagenMobile.push(result.eager[1].secure_url);
        });*/
        result = await uploadToCloudinary(files[i], registro);
        registro.srcImagen.push(result.secure_url);
    }
    console.log(registro.srcImagen);
}

const uploadToCloudinary = async(file, registro) => {
    const result = await cloudinary.v2.uploader.upload(file.tempFilePath, {
        eager: [
            { width: 612, height: 612 },
            { width: 400, height: 400 }
        ]
    }, function (err, result) {
        console.log('Resultado de cloudinary', result);
        registro.publicIds.push(result.public_id);
        registro.srcImagenWeb.push(result.eager[0].secure_url);
        registro.srcImagenMobile.push(result.eager[1].secure_url);
    });

    return result;
}

const uploadToCloudinaryAndRemoveBackground = async(file, registro) => {
    const result = await cloudinary.v2.uploader.upload(file.tempFilePath, {
        eager: [
            { width: 612, height: 612 },
            { width: 400, height: 400 }
        ],
        public_id :  "example" ,
        background_removal : " cloudinary_ai " ,
        notification_url : " https://mysite.example.com/hooks "
    }, function (err, result) {
        console.log('Resultado de cloudinary', result);
        registro.publicIds.push(result.public_id);
        registro.srcImagenWeb.push(result.eager[0].secure_url);
        registro.srcImagenMobile.push(result.eager[1].secure_url);
    });

    return result;
}

const deleteFile = (tipo, src) => {
    const path = `./uploads/${tipo}/${src}`;
    if (fs.existsSync(path)) {
        // Borramos el archivo anterior
        fs.unlinkSync(path);
    }
}

const deleteFileFromCloudinary = async(idsFiles) => {
    for (let x = 0; x < idsFiles.length; x++) {
        await cloudinary.uploader.destroy(idsFiles[x]);
    }
}

const deleteFilesFromPublicaciones = async(publicaciones) => {
    let idsFiles = [];
    publicaciones.forEach(p => {
        if (p.publicIds !== null && p.publicIds.length > 0) {
            p.publicIds.forEach(id => idsFiles.push(id));
        }
    });
    await deleteFileFromCloudinary(idsFiles);
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
                width: size[0],
                height: size[1]
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
    getFile,
    uploadMultipleFileToCDN,
    uploadFileToCDN,
    deleteFileFromCloudinary,
    deleteFilesFromPublicaciones
}