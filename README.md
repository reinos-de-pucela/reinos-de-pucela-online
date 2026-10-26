# Reinos de Pucela Online — paquete corregido

## Estructura necesaria
Sube estos elementos directamente a la raíz del repositorio de GitHub (no dentro de una carpeta adicional):
- `package.json`
- `server.js`
- `render.yaml`
- `README.md`
- carpeta `public/` con `index.html`

## Render
- Runtime: Node
- Build command: `npm install`
- Start command: `npm start`
- Health check path: `/health`

El juego debe abrirse desde la URL publicada por Render; abrir `public/index.html` directamente como archivo local no conecta con el servidor online.

## Alcance actual
Esta beta sincroniza la posición y orientación de jugadores (hasta 10) en salas temporales. El progreso no se guarda; combate, enemigos, NPC, caballos e inventario no están sincronizados todavía.
