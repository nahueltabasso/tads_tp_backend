const { response } = require('express');
const bcrypt = require('bcryptjs');
const Usuario = require('../models/usuario');
const Rol = require('../models/rol');
const { generarJWT } = require('../helpers/jwt');
const {
    HTTP_BAD_REQUEST,
    HTTP_CREATED,
    HTTP_INTERNAL_SERVER_ERROR,
    HTTP_NOT_FOUND, HTTP_STATUS_OK,
    ROLE_USER, MSG_ERROR_ADMINISTRADOR
} = require( "../utils/constantes");
const { googleVerify } = require('../helpers/googleVerify');
const { enviarEmail } = require('../helpers/emailService');
const { hashString } = require('../utils/hash');

const registrarUsuario = async(request, response = response) => {
    const { nombreApellido, email, password, telefono, fechaNacimiento, genero, biografia, hobbies } = request.body;
    try {
        // Validamos si ya existe un usuario con el email del request
        const existeUsuario = await Usuario.findOne({ email: email });
        if (existeUsuario) {
            return response.status(HTTP_BAD_REQUEST).json({
                ok: false,
                msg: 'Ya existe un Usuario con el email ' + email
            });
        }

        const usuario = new Usuario(request.body);
        // Si el rol del usuario es null le asignamos por defecto el rol de ROLE_USER
        if (!usuario.rol) {
            const rol = await Rol.findOne({ nombreRol: ROLE_USER });

            if (!rol) {
                return response.status(HTTP_NOT_FOUND).json({
                    ok: false,
                    msg: 'No existe el Rol en la base de datos'
                });
            }
            usuario.rol = rol;
        }

        // Encriptar la contraseña del usuario
        const salt = bcrypt.genSaltSync();
        usuario.password = bcrypt.hashSync(password, salt);
        // Generamos el token de activacion de la cuenta
        const tokenActivacion = hashString(email);
        usuario.tokenActivacion = tokenActivacion;
        // Persistimos el objeto en la base de datos
        await usuario.save();

        // Envio de email para activacion de cuenta
        const emailStatus = enviarEmail('Registracion Exitosa!', usuario.email,
            'Haga click en el enlase para activar su cuenta!',
            `${process.env.CLIENT_PATH}/activar-cuenta?token=${tokenActivacion}`);
        if (!emailStatus) {
            throw Error('Ocurrio un error con el envio del Email');
        }

        // Generamos el JWT (Json Web Token)
        const token = await generarJWT(usuario.id, usuario.nombreApellido, usuario.email);

        response.status(HTTP_CREATED).json({
            ok: true,
            usuario: usuario,
            token: token
        });
    } catch (error) {
        console.log("Ocurrio un error: ", error);
        response.status(HTTP_INTERNAL_SERVER_ERROR).json({
            ok: false,
            msg: MSG_ERROR_ADMINISTRADOR
        });
    }
}

const activeAccount = async(request, response = response) => {
    const tokenActivacion = request.query.token;
    try {
        if (tokenActivacion) {
            const usuarioDB = await Usuario.findOne({ tokenActivacion: tokenActivacion });
            if (!usuarioDB) {
                return response.status(HTTP_NOT_FOUND).json({
                    ok: false,
                    msg: 'El token no corresponde a ningun usuario'
                });
            }
            // Activamos la cuenta del usuario
            usuarioDB.estado = true;
            const usuarioActivado = await Usuario.findByIdAndUpdate(usuarioDB.id, usuarioDB, { new: true });      // new: true para que retorne el usuario actualizado

            return response.status(HTTP_STATUS_OK).json({
                ok: true,
                msg: 'Cuenta activada!',
                usuario: usuarioActivado
            });
        }
    } catch (error) {
        console.log(error);
        return response.status(HTTP_INTERNAL_SERVER_ERROR).json({
            ok: false,
            msg: MSG_ERROR_ADMINISTRADOR
        });
    }
}

const getRoles = async(request, response = response) => {
    try {
        const roles = await Rol.find();
        response.status(HTTP_STATUS_OK).json({
            ok: true,
            roles: roles
        });
    } catch (error) {
        console.log("Ocurrio un error: ", error);
        response.status(HTTP_INTERNAL_SERVER_ERROR).json({
            ok: false,
            msg: MSG_ERROR_ADMINISTRADOR
        });
    }
}

const login = async(request, response = response) => {
    const { email, password } = request.body;
    try {
        // Verificamos el email
        const usuario = await Usuario.findOne({ email: email });
        if (!usuario) {
            return response.status(HTTP_NOT_FOUND).json({
                ok: false,
                msg: 'Email o Contraseña incorrectas!'
            });
        }

        // Verificamos la contraseña
        const validPassword = bcrypt.compareSync(password, usuario.password);
        if (!validPassword) {
            return response.status(HTTP_BAD_REQUEST).json({
                ok: false,
                msg: 'Email o Contraseña incorrectas!'
            });
        }

        // Generamos el JWT (Json Web Token)
        const token = await generarJWT(usuario.id, usuario.nombreApellido, usuario.email);

        response.status(HTTP_STATUS_OK).json({
            ok: true,
            token: token
        });
    } catch (error) {
        console.log(error);
        response.status(HTTP_INTERNAL_SERVER_ERROR).json({
            ok: false,
            msg: MSG_ERROR_ADMINISTRADOR
        });
    }
}

const googleLogin = async(request, response = response) => {
    const googleToken = request.body.token
    try {
        // Validamos el token
        const { name, email, picture } = await googleVerify(googleToken);

        // Validamos si existe un usuario con el email
        const usuarioDB = await Usuario.findOne({ email });
        let usuario;
        if (!usuarioDB) {
            // Si no existe el usuario en la base de datos
            // Obtenemos el rol por defecto (ROLE_USER)
            const rol = await Rol.findOne({ nombreRol: ROLE_USER });
            usuario = new Usuario({
                nombreApellido: name,
                email: email,
                password: '@@@@@@@@@@@@@',
                srcImg: picture,
                fechaNacimiento: new Date(),
                rol: rol,
                genero: 'M',
                google: true,
                estado: true
            });
        } else {
            // Existe el usuario
            usuario = usuarioDB;
            usuario.google = true;
            usuario.password = '@@@@@@@@@@@@';
        }

        // Persistimos los cambios en la base de datos;
        await usuario.save();

        // Generamos el JWT (Json Web Token)
        const token = await generarJWT(usuario.id, usuario.nombreApellido, usuario.email);
        response.status(HTTP_STATUS_OK).json({
            ok: true,
            token: token
        });
    } catch (error) {
        console.log(error);
        response.status(HTTP_INTERNAL_SERVER_ERROR).json({
            ok: false,
            msg: 'Token de Google Invalido!'
        });
    }
}

const facebookLogin = async(request, response = response) => {
    console.log('Facebook Auth');
}

module.exports = {
    registrarUsuario,
    activeAccount,
    getRoles,
    login,
    googleLogin,
    facebookLogin
}