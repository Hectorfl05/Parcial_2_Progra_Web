import express from "express";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";


const app = express();

app.use(express.json());

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const librosPath = path.join(__dirname, "src", "libros_1000.json");
let libros = [];
try {
    const raw = fs.readFileSync(librosPath, "utf-8");
    libros = JSON.parse(raw);
} catch (err) {
    console.error("No se pudo cargar el archivo de libros:", err.message);
}

app.get("/libros", (req, res) => {
    try {
        res.json(libros);
    } catch (error) {
        res.status(500).json({ error: "Error al leer datos" });
    }
});

app.get("/libros/:id", (req, res) => {
    try {
        const { id } = req.params;
        const libro = libros.find(l => l.id === id);
        if (libro) return res.json(libro);
        return res.status(404).json({ error: "Libro no existe" });
        
    } catch (error) {
        return res.status(400).json({ error: "Id Invalido" });
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
            return res.status(409).json({ error: "Libro con este título y año ya existe" });
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
        return res.status(400).json({ error: "Id inválido" });
    }

    if (index !== -1) {
        libros.splice(index, 1);
        res.status(200);
        res.json({ message: "Libro eliminado" });
    } else {
        res.status(404).json({ error: "Libro no existe" });
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
  console.log(`Server is running on http://localhost:${PORT}`);
});

app.use((err, req, res, next) => {
    console.error('Unexpected error:', err);
    res.status(500).json({ error: err?.message || 'Internal Server Error' });
});

export default app;