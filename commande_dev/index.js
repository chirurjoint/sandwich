const mysql = require('mysql')

const mySqlClient = mysql.createConnection({
  host     : "mysql.commande",
  user     : "command_lbs",
  password : "command_lbs",
  database : "command_lbs"
});
let hasOwnProperty = Object.prototype.hasOwnProperty;

function is_empty(obj) {

    // null and undefined are empty
    if (obj == null) return true;
    // Assume if it has a length property with a non-zero value
    // that that property is correct.
    if (obj.length && obj.length > 0)    return false;
    if (obj.length === 0)  return true;

    for (var key in obj) {
        if (hasOwnProperty.call(obj, key))    return false;
    }

    return true;
}

const express = require('express')
const app = express()
const body_parser = require('body-parser')
app.use(body_parser.json())


  app.listen(8080, function () {
    console.log('Example app listening on port 8080!')
  })


app.get('/', function (req, res) {
  res.json({hello:"Hello World!"})
})



app.get('/commandes', function (req, res) {
    let selectQuery = 'SELECT * FROM commande;';
    mySqlClient.query(selectQuery, function (err, result) {
    if (err){
      res.send({type:"error",error:500,message : 'Erreur interne'})
    }else{
      res.send(result)
    }
    });
});

app.get('/:commande/:id',function(req,res) {
    let selectQuery = "SELECT * FROM commande WHERE id = '"+req.params.id+"';";
    if(req.params.commande != "commande"){
      res.send({type:"error",error:400,message : 'Route non connu '})

    }else{
      mySqlClient.query(selectQuery, function (err, result) {
        if (err){
            res.send({type:"error",error:500,message : 'Erreur interne'})
        } 
        else{
          if(is_empty(result)){
            res.send({type:"error",error:404,message : 'Identifiant invalide'})
          }else{
            res.send(result)
          }
        }
        });
    }

});

app.post('/commandes/:id',function(req,res) {
  res.send({type:"error",error:405,message : 'Pas de requete en post ici !'})
});

function makeid(length) {
  var result           = '';
  var characters       = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  var charactersLength = characters.length;
  for ( var i = 0; i < length; i++ ) {
     result += characters.charAt(Math.floor(Math.random() * charactersLength));
  }
  return result;
}

app.put('/:commande/:id',function (req,res) {
  let body = req.body
  if (body.mail_client == "" || body.date_commande=="" || body.montant == ""){
    res.send({type:"error",error:400,message : 'Les informations entrer sont manquantes'})
  }else{
    if(req.params.commande != "commande"){
      res.send({type:"error",error:400,message : 'Route non connu '})
    }else{
    let selectQuery = "UPDATE commande SET mail_client= '"+body.mail_client+"', date_commande = '"+body.date_commande+"', montant = "+body.montant+" WHERE id = '"+req.params.id+"';"; 
      mySqlClient.query(selectQuery,function (err, result) {
        if (err){
            res.send({type:"error",error:500,message : 'Erreur interne'})
        } 
        else{
          if(result.affectedRows == 0){
            res.send({type:"error",error:404,message : 'Identifiant invalide'})
          }else{
            res.send({type:"success",method:"PATCH",code:200, message : 'Information mis à jour', commande : {id: req.params.id, mail_client: body.mail_client, date_commande :body.date_commande, montant: body.montant }})
          }
        }
        });
    }
  }
})


app.post('/commande',function(req,res){
  let id = makeid(5)+"-"+makeid(5)
  let body = req.body
  let selectQuery = "INSERT INTO commande VALUE (?,?,?,?,?);"
  let url = "localhost:19080/commande/"+id
  res.location(url)
  let tab = [
    id,
    body.mail_client,
    body.date_commande,
    body.montant,
    body.status
  ]
  mySqlClient.query(selectQuery,tab ,function (err, result) {
  if (err){
    res.send({type:"error",error:500,message : 'Erreur interne'})
  }else{
    res.send({type:"success",error:201 ,message : 'Created !', location: url, commande: {id: tab[0],email: tab[1],data: tab[2],montant:tab[3],status:tab[4]}})
  }
  });

})






