# Decision De Diseno Sobre Claves

## Contexto

El sistema tiene dos tipos de acceso relevantes:

- acceso del administrador;
- acceso de profesores.

Se decidio que el administrador gestione las credenciales de los profesores desde la pantalla de administracion, pero que su propia clave no dependa de la base de datos del sistema.

## Decision

### Clave Del Administrador

- la clave del administrador se define fuera de la base de datos;
- se carga mediante variable de entorno;
- queda bajo control directo del desarrollador o responsable tecnico;
- no se administra desde la interfaz del sistema.

### Claves De Profesores

- las claves de profesores se almacenan en la base de datos;
- se guardan encriptadas;
- el administrador puede cambiarlas desde la pantalla de administracion;
- al guardar una nueva clave, la clave anterior se reemplaza por la nueva version encriptada;
- el administrador no puede volver a visualizar la clave una vez guardada.

## Reglas Operativas

1. El administrador puede resetear o cambiar la clave de cualquier profesor.
2. El profesor inicia sesion con la credencial que el administrador le haya definido.
3. Si el administrador cambia la clave de un profesor, la nueva credencial pasa a ser la unica valida.
4. La interfaz solo debe permitir ingresar una nueva clave, no revelar la existente.

## Impacto En El Diseno

- la pantalla de administracion de profesores debe incluir una accion para cambiar clave;
- la base de datos debe almacenar solo la version protegida de la clave del profesor;
- la configuracion del entorno debe incluir una variable para la clave del administrador;
- la logica de autenticacion del administrador y la de profesores quedan separadas.

## Nota

Esta es una decision de diseno e implementacion. No hace falta modelarla completa en Alloy, salvo en la parte conceptual donde el administrador define credenciales de profesores.
