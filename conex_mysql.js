const cnx = require("mysql");

const conexion = cnx.createConnection({
  host: "localhost",
  user: "root",
  password: "",
  database: "tienda",
});

const conectar = () => {
  conexion.connect((err) => {
    if (err) throw err;

    console.log("conectado correctamente a la bd");
  });
};

module.exports = {
  conectar,
};
