const express = require('express');
const cors = require('cors');
const empleadosRoutes = require('./routes/empleados.routes');
const app = express();

app.use(cors());
app.use(express.json());
app.use('/api/empleados', empleadosRoutes);

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Backend corriendo en http://localhost:${PORT}`);
});
