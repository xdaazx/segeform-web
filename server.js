/* eslint-env node */
import express from 'express';
import pkg from 'pg';
const { Pool } = pkg;
import cors from 'cors';
import bcrypt from 'bcryptjs';
import 'dotenv/config';

const app = express();
app.use(cors());
app.use(express.json());

/* ============================
    CONEXIÓN A POSTGRES (SUPABASE)
============================ */
const isProduction = process.env.NODE_ENV === 'production' || process.env.DATABASE_URL?.includes('supabase.co');

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  user: process.env.DB_USER,
  host: process.env.DB_HOST,
  database: process.env.DB_NAME,
  password: process.env.DB_PASSWORD,
  port: parseInt(process.env.DB_PORT || '5432', 10),
  ssl: isProduction ? { rejectUnauthorized: false } : false
});

pool.connect((err, client, release) => {
  if (err) {
    return console.error('🔴 Error de conexión a la base de datos:', err.stack);
  }
  console.log('🟢 Conexión exitosa a la base de datos de SEGEFORM');
  release();
});
  
/* ============================
    OBTENER GUARDIAS
============================ */
app.get('/api/guardias', async (req, res) => {
  try {
    const result = await pool.query(
      'SELECT * FROM ficha_inscripcion ORDER BY id DESC'
    );
    res.json(result.rows);
  } catch (err) {
    console.error('ERROR GET:', err.message);
    res.status(500).json({ error: err.message });
  }
});

/* ============================
    OBTENER FICHA POR ID
============================ */
app.get('/api/guardias/:id', async (req, res) => {
  const { id } = req.params;
  try {
    const result = await pool.query(
      'SELECT * FROM ficha_inscripcion WHERE id = $1',
      [id]
    );
    if (result.rows.length === 0) {
      return res.status(404).json({ success: false, message: 'No encontrado' });
    }
    res.json(result.rows[0]);
  } catch (err) {
    console.error('❌ ERROR GET ID:', err.message);
    res.status(500).json({ success: false, error: err.message });
  }
});

/* ============================
    GUARDAR NUEVA FICHA
============================ */
app.post('/api/registro', async (req, res) => {
  const d = req.body;
  try {
    const query = `
      INSERT INTO ficha_inscripcion (
        cedula, apellidos_nombres, edad, tipo_sangre, correo_electronico,
        nivel_i, reentrenamiento, nivel_ii, nivel_iii, nivel_academico,
        lugar_trabajo, direccion_trabajo, libreta_militar,
        telf_convencional, celular, telf_familiar, parentesco,
        direccion_domicilio, provincia, canton, ciudad,
        num_documento, abono_1, abono_2, saldo
      ) VALUES (
        $1,$2,$3,$4,$5,$6,$7,$8,$9,$10,
        $11,$12,$13,$14,$15,$16,$17,$18,$19,$20,
        $21,$22,$23,$24,$25
      )
      RETURNING *;
    `;

    const values = [
      d.cedula, d.apellidos_nombres, parseInt(d.edad) || null, d.tipo_sangre, d.correo_electronico,
      d.nivel_i || false, d.reentrenamiento || false, d.nivel_ii || false, d.nivel_iii || false, d.nivel_academico,
      d.lugar_trabajo, d.direccion_trabajo, d.libreta_militar || false, d.telf_convencional, d.celular,
      d.telf_familiar, d.parentesco, d.direccion_domicilio, d.provincia, d.canton, d.ciudad,
      d.num_documento, parseFloat(d.abono_1) || 0, parseFloat(d.abono_2) || 0, parseFloat(d.saldo) || 0
    ];

    const result = await pool.query(query, values);
    res.status(201).json({ success: true, data: result.rows[0] });
  } catch (err) {
    console.error('❌ ERROR GUARDAR:', err.message);
    res.status(500).json({ success: false, error: err.message });
  }
});

/* ============================
    EDITAR FICHA COMPLETA (PUT)
============================ */
app.put('/api/guardias/:id', async (req, res) => {
  const { id } = req.params;
  const d = req.body;
  try {
    const query = `
      UPDATE ficha_inscripcion SET
        cedula = $1, apellidos_nombres = $2, edad = $3, tipo_sangre = $4, correo_electronico = $5,
        nivel_i = $6, reentrenamiento = $7, nivel_ii = $8, nivel_iii = $9, nivel_academico = $10,
        lugar_trabajo = $11, direccion_trabajo = $12, libreta_militar = $13,
        telf_convencional = $14, celular = $15, telf_familiar = $16, parentesco = $17,
        direccion_domicilio = $18, provincia = $19, canton = $20, ciudad = $21,
        num_documento = $22, abono_1 = $23, abono_2 = $24, saldo = $25
      WHERE id = $26
      RETURNING *;
    `;

    const values = [
      d.cedula, d.apellidos_nombres, parseInt(d.edad) || null, d.tipo_sangre, d.correo_electronico,
      Boolean(d.nivel_i), Boolean(d.reentrenamiento), Boolean(d.nivel_ii), Boolean(d.nivel_iii),
      d.nivel_academico, d.lugar_trabajo, d.direccion_trabajo, Boolean(d.libreta_militar),
      d.telf_convencional, d.celular, d.telf_familiar, d.parentesco,
      d.direccion_domicilio, d.provincia, d.canton, d.ciudad,
      d.num_documento, Number(d.abono_1) || 0, Number(d.abono_2) || 0, Number(d.saldo) || 0,
      id
    ];

    const result = await pool.query(query, values);
    res.json({ success: true, data: result.rows[0] });
  } catch (err) {
    console.error('❌ ERROR:', err.message);
    res.status(500).json({ error: err.message });
  }
});

/* ============================
    ELIMINAR GUARDIA
============================ */
app.delete('/api/guardias/:id', async (req, res) => {
  const { id } = req.params;
  try {
    const result = await pool.query(
      'DELETE FROM ficha_inscripcion WHERE id = $1',
      [id]
    );
    if (result.rowCount === 0) {
      return res.status(404).json({ success: false, message: 'No encontrado' });
    }
    res.json({ success: true, message: 'Registro eliminado correctamente' });
  } catch (err) {
    console.error('❌ ERROR ELIMINAR:', err.message);
    res.status(500).json({ success: false, error: err.message });
  }
});

/* ============================
   LOGIN DE USUARIOS
============================ */
app.post('/api/login', async (req, res) => {
  const { email, password } = req.body;

  try {
    const result = await pool.query(
      'SELECT * FROM public.usuarios WHERE LOWER(correo_electronico) = LOWER($1)',
      [email.trim()]
    );

    if (result.rows.length === 0) {
      return res.status(401).json({
        success: false,
        message: 'Credenciales incorrectas'
      });
    }

    const user = result.rows[0];

    const match = await bcrypt.compare(
      password.trim(),
      user.contrasena_hash
    );

    if (!match) {
      return res.status(401).json({
        success: false,
        message: 'Credenciales incorrectas'
      });
    }

    res.json({
      success: true,
      nombre: user.nombre_usuario,
      rol: user.rol
    });

  } catch (error) {
    console.error('❌ LOGIN ERROR:', error);
    res.status(500).json({
      success: false,
      error: 'Error del servidor'
    });
  }
});

/* =========================================
   GESTIÓN DE ADMINISTRADORES (CRUD)
   ========================================= */

// 1. Obtener todos los administradores
app.get('/api/admins', async (req, res) => {
  try {
    const result = await pool.query(
      'SELECT id, nombre_usuario, correo_electronico, rol FROM usuarios ORDER BY id ASC'
    );
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ error: 'Error al obtener administradores' });
  }
});

// 2. Registrar nuevo administrador
app.post('/api/admins', async (req, res) => {
  const { nombre, email, password } = req.body;
  try {
    // Encriptamos la contraseña antes de guardar
    const salt = await bcrypt.genSalt(10);
    const hashedPass = await bcrypt.hash(password.trim(), salt);

    const query = `
      INSERT INTO usuarios (nombre_usuario, correo_electronico, contrasena_hash, rol)
      VALUES ($1, $2, $3, 'admin') RETURNING id, nombre_usuario;
    `;
    const result = await pool.query(query, [nombre, email, hashedPass]);
    res.status(201).json(result.rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'El correo ya existe o hubo un error en la DB' });
  }
});

// 3. Actualizar administrador (Nombre y/o Contraseña)
app.put('/api/admins/:id', async (req, res) => {
  const { id } = req.params;
  const { nombre, email, password } = req.body;
  try {
    let query;
    let values;

    if (password && password.trim() !== "") {
      // Si el admin escribió una nueva clave, la encriptamos
      const salt = await bcrypt.genSalt(10);
      const hashedPass = await bcrypt.hash(password.trim(), salt);
      query = `UPDATE usuarios SET nombre_usuario=$1, correo_electronico=$2, contrasena_hash=$3 WHERE id=$4`;
      values = [nombre, email, hashedPass, id];
    } else {
      // Si no escribió clave, solo actualizamos datos básicos
      query = `UPDATE usuarios SET nombre_usuario=$1, correo_electronico=$2 WHERE id=$3`;
      values = [nombre, email, id];
    }

    await pool.query(query, values);
    res.json({ success: true, message: 'Administrador actualizado' });
  } catch (err) {
    res.status(500).json({ error: 'Error al actualizar' });
  }
});

// 4. Eliminar administrador
app.delete('/api/admins/:id', async (req, res) => {
  const { id } = req.params;
  try {
    // Evitamos que se borre el ID 1 por seguridad
    if (id === '1') return res.status(403).json({ error: 'No se puede eliminar al root' });
    
    await pool.query('DELETE FROM usuarios WHERE id = $1', [id]);
    res.json({ success: true, message: 'Acceso revocado' });
  } catch (err) {
    res.status(500).json({ error: 'Error al eliminar' });
  }
});


/* ============================
    SERVER
============================ */
const PORT = process.env.PORT || 5000;
app.listen(PORT, () =>
  console.log(`🚀 Servidor SEGEFORM activo en puerto ${PORT}`)
);

export default app;