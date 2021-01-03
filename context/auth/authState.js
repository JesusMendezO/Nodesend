import React, { useReducer } from 'react';
import authContext from './authContext';
import authReducer from './authReducer'
import {
    REGISTRO_EXITOSO,
    OCULTAR_ALERTA,
    USUARIO_AUTENTICADO,
    REGISTRO_ERROR,
    LOGIN_ERROR,
    LOGIN_EXITOSO,
    CERRAR_SESION
} from '../../types/index';

import clienteAxios from '../../config/axios';
import tokenAuth from '../../config/tokenauth';

const AuthState = ({children}) =>{

    //Definir un state inicial
    const initialState = {
        token: typeof window !== 'undefined' ? localStorage.getItem('token') : '',
        autenticado: null,
        usuario: null,
        mensaje: null
    }

    //Definir el reducer
    const [ state, dispatch] = useReducer(authReducer, initialState);

    //registrar  nuevos usuario
    const registrarUsuario =  async datos => {
        
        try {
            const respuesta = await clienteAxios.post('/api/usuarios', datos);
            console.log(respuesta.data.msg);
            dispatch({
                type: REGISTRO_EXITOSO,
                payload: respuesta.data.msg
            });
           
        } catch (error) {
            dispatch({
                type: REGISTRO_ERROR,
                payload: error.response.data.msg
            });
           
            
        }
         //oculta la alerta despues de 3 segundos
         setTimeout(() => {
            dispatch({
                type: OCULTAR_ALERTA
               
            });
        }, 3000);
    }


    //autenticar usuarios
    const iniciarSesion = async datos => {
        try {
             const respuesta = await clienteAxios.post('/api/auth', datos)
             dispatch({
                 type: LOGIN_EXITOSO,
                payload: respuesta.data.token
             });
             
        } catch (error) {
            dispatch({
                type: LOGIN_ERROR,
                payload: error.response.data.msg
            });
            
        }
        //oculta la alerta despues de 3 segundos
        setTimeout(() => {
            dispatch({
                type: OCULTAR_ALERTA,
               
            });
        }, 3000);
    }


     // Retorne el Usuario autenticado en base al JWT
     const usuarioAutenticado = async () => {
        const token = localStorage.getItem('token');
        if(token) {
            tokenAuth(token)
        }

        try {
            const respuesta = await clienteAxios.get('/api/auth');

            if(respuesta.data.usuario) {
                dispatch({
                    type: USUARIO_AUTENTICADO,
                    payload: respuesta.data.usuario
                }) 
            }

        } catch (error) {
            dispatch({
                type: LOGIN_ERROR,
                payload: error.response.data.msg
            })
        }
    }

    //cerrar la sesion 
    const cerrarSesion = () => {
        dispatch({
            type: CERRAR_SESION
        })
    }

    return (
        <authContext.Provider
         value={{
             token: state.token,
             autenticado: state.autenticado,
             usuario: state.usuario,
             mensaje: state.mensaje,
             registrarUsuario,
             iniciarSesion,
             usuarioAutenticado,
             cerrarSesion
         }}
        >
         {children}
        </authContext.Provider>
    )
}

export default AuthState;