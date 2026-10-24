# Reinos de Pucela Online — beta

Primera base online para jugar con amigos (hasta 10 personas por sala). El servidor mantiene únicamente las conexiones y posiciones mientras dura la sesión; no guarda personajes ni progreso.

## Probar en tu ordenador

Requisitos: Node.js 18 o superior.

```bash
npm install
npm start
```

Abre `http://localhost:3000` en el navegador. Para que otro ordenador entre, ambos necesitan llegar a una instancia publicada en internet; `localhost` solo funciona en el propio equipo.

## Publicar con el plan gratuito de Render

1. Descomprime este proyecto.
2. Sube la carpeta completa a un repositorio de GitHub.
3. En Render, crea un servicio **New + → Web Service** y conecta ese repositorio.
4. Render detectará `render.yaml`; si pide valores manuales usa:
   - Build command: `npm install`
   - Start command: `npm start`
   - Runtime: Node
5. Espera a que termine el despliegue y abre la URL `https://...onrender.com`.
6. Comparte esa URL con tus amigos. Una persona pulsa **Crear sala** y comparte el código; los demás lo escriben y pulsan **Unirme**.

El plan gratuito puede suspender el servicio tras un periodo sin actividad y la primera conexión después de la suspensión puede tardar. Las condiciones de los planes cambian, así que confirma los límites actuales en Render antes de publicar.

## Alcance de esta beta

- Hasta 10 jugadores por sala.
- Sincroniza la posición y orientación de los avatares.
- Las salas son temporales y desaparecen al quedarse vacías.
- No se guarda progreso y aún no se sincronizan combate, enemigos, NPC, caballos ni inventario. Cada jugador ejecuta su propia simulación local del mundo.
- Es una beta inicial, no un servidor endurecido para producción pública.

## Seguridad y privacidad

No incluye cuentas ni contraseñas. No pongas secretos ni claves en el HTML. Para una comunidad pública, harían falta límites de frecuencia, validación adicional y más controles del servidor.
