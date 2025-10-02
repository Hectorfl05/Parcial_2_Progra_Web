import express from "express";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";


const app = express();

app.use(express.json());

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const librosPath = path.join(__dirname, "data", "libros_1000.json");
let libros = [];
try {
    const raw = fs.readFileSync(librosPath, "utf-8");
    libros = JSON.parse(raw);
} catch (err) {
    console.error("No se pudo cargar el JSON con la informacion de los libros:", err.message);
}

app.get("/libros", (req, res) => {
    try {
        res.json(libros);
    } catch (error) {
        res.status(500).json({ error: "Error al leer la informacion" });
    }
});

app.get("/libros/:id", (req, res) => {
    try {
        const { id } = req.params;
        const libro = libros.find(l => l.id === id);
        if (libro) return res.json(libro);
        return res.status(404).json({ error: "Libro no existe" });
        
    } catch (error) {
        return res.status(400).json({ error: "Id invalido" });
    }
});

app.post("/libros", (req, res) => {
    
    try {
        const newLibro = req.body;
        if (!newLibro.id || !newLibro.title || !newLibro.author || !newLibro.year) {
            return res.status(400).json({ error: " Faltan campos obligatorios" });
        }
        const exists = libros.some(l => l.title === newLibro.title && l.year === newLibro.year);
        if (exists) {
            return res.status(409).json({ error: "Libro ya existente" });
        }
        libros.push(newLibro);
        res.status(201).json(newLibro);
    } catch (error) {
        return res.status(500).json({ error: "Error al leer datos" });
    }
});

app.delete("/libros/:id", (req, res) => {
   
    const { id } = req.params;
    const index = libros.findIndex(l => l.id === id);
    
    if (!uuidRegex.test(id)) {
        return res.status(400).json({ error: "Id invalido" });
    }

    if (index !== -1) {
        libros.splice(index, 1);
        res.status(200);
        res.json({ message: "Libro eliminado exitosamente" });
    } else {
        res.status(404).json({ error: "Libro no existe en el registro" });
    }
});

const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
app.get('/api/libros/:id', (req, res, next) => {
    try {
        const { id } = req.params;
        if (!uuidRegex.test(id)) {
            return res.status(400).json({ error: 'Id inválido' });
        }
        const libro = libros.find(l => l.id === id);
        if (!libro) return res.status(404).json({ error: 'Libro no existe' });
        return res.status(200).json(libro);
    } catch (err) {
        return next(err);
    }
});

const PORT = 3000;

app.listen(PORT, () => {
  console.log(`Sevidor escuchando en http://localhost:${PORT}`);
});



app.use((err, req, res, next) => {
    console.error('Error inesperado:', err);
    res.status(500).json({ error: err?.message || 'Error Interno en el servidor' });
});

export default app;