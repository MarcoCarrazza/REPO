const mysql = require('mysql');
const dotenv = require('dotenv');

dotenv.config()

const pool = mysql.createPool({
  connectionLimit: 100,
  host: process.env.DB_HOST,
  database: process.env.DB_NAME,
  user: process.env.DB_USER,
  password: process.env.DB_PASS
})
 
 // Recibe una declaración sql y los valores requeridos
 // La razón para recibir los valores del segundo parámetro aquí es que puede usar el marcador de posición de mysql '?'
 // como query (`select * from my_database where id =?`, [1])
 
let query = function( sql, values ) {
     // devolver una promesa
  return new Promise(( resolve, reject ) => {
    pool.getConnection(function(err, connection) {
      if (err) {
        reject( err )
      } else {
        connection.query("SET time_zone = '-03:00'")
        connection.query(sql, values, ( err, rows ) => {
          if ( err ) {
            reject( err )
          } else {
            resolve( rows )
          }
          // finaliza la sesión
          connection.release()
          console.log('Desconectado de la DB!');
        })
      }
    })
  })
}
 
module.exports =  query